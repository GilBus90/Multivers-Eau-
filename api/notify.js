// ════════════════════════════════════════════════════════════════════════════
// api/notify.js — VERSION SUPER ADMIN "GOD VIEW"
// flashman90 reçoit TOUT · Dual rôle Admin + Relais Grand Lomé
// Priorités : 🔴 URGENT | 🟡 IMPORTANT | ⚪ INFO
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_PI       = process.env.VITE_ADMIN_USER;      // "flashman90"
const ADMIN_WA       = process.env.ADMIN_WHATSAPP;       // son numéro WhatsApp
const GRAND_LOME_ID  = process.env.GRAND_LOME_RELAIS_ID; // UUID du relais Grand Lomé

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-webhook-secret'] !== process.env.SUPABASE_WEBHOOK_SECRET)
    return res.status(401).end();

  const { table, type: evt, record: rec, old_record: old } = req.body;

  const dispatch = {
    commandes: {
      INSERT: () => onNouvelleCommande(rec),
      UPDATE: () => onStatutCommande(rec, old),
    },
    livreurs: {
      INSERT: () => onCandidatureLivreur(rec),
      UPDATE: () => onValidationLivreur(rec, old),
    },
    relais: {
      INSERT: () => onCandidatureRelais(rec),
    },
    stocks: {
      UPDATE: () => onStockChange(rec, old),
    },
    transactions_pi: {
      UPDATE: () => onTransactionPi(rec, old),
    },
  };

  try {
    await dispatch[table]?.[evt]?.();
  } catch (e) {
    console.error(`notify error [${table}/${evt}]:`, e);
  }

  res.status(200).json({ ok: true });
}

// ════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ════════════════════════════════════════════════════════════════════════════

// ── 1. Nouvelle commande ──────────────────────────────────────────────────────
async function onNouvelleCommande(cmd) {
  const relais = await getRelais(cmd.relais_id);

  // ▸ Relais concerné (sauf si c'est Grand Lomé → admin reçoit en tant que relais)
  if (relais?.pi_username && relais.pi_username !== ADMIN_PI) {
    await notif(relais.pi_username, 'relais', '🟡', 'nouvelle_commande',
      '📦 Nouvelle commande !',
      `${fmtFcfa(cmd.total_fcfa)} · π${cmd.total_pi} · ${cmd.adresse_courte || ''}`,
      { commande_id: cmd.id }
    );
    await wa(relais.tel_whatsapp,
      `📦 *Nouvelle commande — ${relais.nom}*\n` +
      `💰 ${fmtFcfa(cmd.total_fcfa)} FCFA · π${cmd.total_pi}\n` +
      `📍 ${cmd.adresse}\n\n` +
      `→ Pi Browser : Multivers'Eau pour assigner un livreur.`
    );
  }

  // ▸ ADMIN — reçoit TOUTES les commandes (God View)
  // Si c'est son propre relais Grand Lomé → badge "🏪 Mon Relais"
  const estSonRelais = cmd.relais_id === GRAND_LOME_ID;
  await notif(ADMIN_PI, 'admin', '🟡', 'nouvelle_commande',
    estSonRelais ? '📦 Commande — Mon Relais (Grand Lomé)' : `📦 Commande — ${relais?.nom || 'Relais'}`,
    `${fmtFcfa(cmd.total_fcfa)} · π${cmd.total_pi}`,
    { commande_id: cmd.id, relais_id: cmd.relais_id, estSonRelais }
  );

  // WhatsApp admin UNIQUEMENT si commande importante (>50 000 FCFA)
  if (cmd.total_fcfa >= 50000) {
    await wa(ADMIN_WA,
      `📦 *Grosse commande — ${relais?.nom}*\n` +
      `💰 ${fmtFcfa(cmd.total_fcfa)} FCFA · π${cmd.total_pi}\n` +
      `📍 ${cmd.adresse}`
    );
  }
}

// ── 2. Changement statut commande ─────────────────────────────────────────────
async function onStatutCommande(cmd, old) {
  if (cmd.statut === old.statut) return;

  // ▸ Assignée → notifier livreur
  if (cmd.statut === 'assignee') {
    const livreur = await getLivreur(cmd.livreur_id);
    if (livreur) {
      await notif(livreur.pi_username, 'livreur', '🔴', 'nouvelle_course',
        '🏍️ Nouvelle course !',
        `Gain π${(cmd.total_pi * 0.10).toFixed(3)} · ${cmd.adresse}`,
        { commande_id: cmd.id }
      );
      await wa(livreur.tel_whatsapp,
        `🏍️ *Course disponible !*\n` +
        `📍 ${cmd.adresse}\n` +
        `💰 Gain : π${(cmd.total_pi * 0.10).toFixed(3)}\n` +
        `→ Multivers'Eau pour accepter.`
      );
    }
    // Admin informé (tracking global)
    await notif(ADMIN_PI, 'admin', '⚪', 'course_assignee',
      '🏍️ Course assignée',
      `${livreur?.nom} → ${cmd.adresse_courte}`,
      { commande_id: cmd.id }
    );
  }

  // ▸ En cours → tracking admin
  if (cmd.statut === 'en_cours') {
    await notif(ADMIN_PI, 'admin', '⚪', 'livraison_en_cours',
      '🚗 Livraison en cours',
      `Commande #${cmd.id.slice(-6).toUpperCase()}`,
      { commande_id: cmd.id }
    );
  }

  // ▸ Livrée → notifier tout le monde
  if (cmd.statut === 'livree') {
    const relais  = await getRelais(cmd.relais_id);
    const livreur = await getLivreur(cmd.livreur_id);

    // Client → WhatsApp confirmation
    if (cmd.tel_client) {
      await wa(cmd.tel_client,
        `✅ *Votre commande a été livrée !*\n` +
        `💧 Merci pour votre confiance — Multivers'Eau\n` +
        `💰 π${cmd.total_pi} débité`
      );
    }

    // Relais → confirmation (sauf si admin = relais)
    if (relais?.pi_username && relais.pi_username !== ADMIN_PI) {
      await notif(relais.pi_username, 'relais', '🟡', 'livraison',
        '✅ Commande livrée',
        `+${fmtFcfa(cmd.total_fcfa)} · π${(cmd.total_pi * 0.80).toFixed(3)} crédité`,
        { commande_id: cmd.id }
      );
    }

    // Livreur → gains crédités
    if (livreur?.pi_username) {
      await notif(livreur.pi_username, 'livreur', '🟡', 'livraison',
        '💰 Course livrée !',
        `+π${(cmd.total_pi * 0.10).toFixed(3)} crédité`,
        { commande_id: cmd.id }
      );
    }

    // Admin → tracking + split
    const estSonRelais = cmd.relais_id === GRAND_LOME_ID;
    await notif(ADMIN_PI, 'admin', '🟡', 'livraison',
      estSonRelais ? '✅ Livré — Mon Relais' : `✅ Livré — ${relais?.nom}`,
      `Commission : π${(cmd.total_pi * 0.10).toFixed(3)} · par ${livreur?.nom || '?'}`,
      { commande_id: cmd.id, commission: cmd.total_pi * 0.10 }
    );
  }

  // ▸ Non livré / Annulé → alerte URGENTE admin
  if (cmd.statut === 'annulee' || cmd.statut === 'echec') {
    await notif(ADMIN_PI, 'admin', '🔴', 'echec_livraison',
      '🚨 Échec de livraison',
      `Commande #${cmd.id.slice(-6).toUpperCase()} · ${fmtFcfa(cmd.total_fcfa)}`,
      { commande_id: cmd.id }
    );
    await wa(ADMIN_WA,
      `🚨 *ALERTE — Livraison échouée*\n` +
      `Commande #${cmd.id.slice(-6).toUpperCase()}\n` +
      `💰 ${fmtFcfa(cmd.total_fcfa)} FCFA\n` +
      `📍 ${cmd.adresse}\n\n` +
      `Action requise dans Multivers'Eau.`
    );
  }
}

// ── 3. Candidature Livreur ────────────────────────────────────────────────────
async function onCandidatureLivreur(livreur) {
  const relais = await getRelais(livreur.relais_id);

  // Relais référent → vérification physique de l'équipement
  if (relais?.pi_username && relais.pi_username !== ADMIN_PI) {
    await notif(relais.pi_username, 'relais', '🔴', 'candidature_livreur',
      '🤝 Candidature livreur à vérifier',
      `${livreur.nom} · ${livreur.vehicule} · ${livreur.quartier}`,
      { livreur_id: livreur.id }
    );
    await wa(relais.tel_whatsapp,
      `🤝 *Candidature Livreur — À vérifier*\n\n` +
      `👤 ${livreur.nom}\n🏍️ ${livreur.vehicule}\n📍 ${livreur.quartier}\n\n` +
      `Vérifiez l'équipement physiquement puis recommandez dans l'app.`
    );
  }

  // ADMIN — toujours notifié, même pour Grand Lomé (dual rôle)
  const estSonRelais = livreur.relais_id === GRAND_LOME_ID;
  await notif(ADMIN_PI, 'admin', '🔴', 'candidature_livreur',
    estSonRelais
      ? '🏍️ Candidature livreur — Mon Relais (validation directe)'
      : `🏍️ Candidature livreur — ${relais?.nom}`,
    `${livreur.nom} · ${livreur.vehicule}`,
    { livreur_id: livreur.id, validation_directe: estSonRelais }
  );

  // WhatsApp urgent si Grand Lomé (admin = relais → validation directe)
  if (estSonRelais) {
    await wa(ADMIN_WA,
      `🏍️ *Candidature Livreur — Grand Lomé (À VALIDER)*\n\n` +
      `👤 ${livreur.nom}\n🏍️ ${livreur.vehicule}\n` +
      `📍 ${livreur.quartier} · ${livreur.distDepot} km du dépôt\n\n` +
      `→ Admin Multivers'Eau pour valider directement.`
    );
  } else {
    await wa(ADMIN_WA,
      `🏍️ *Nouveau candidat livreur — ${relais?.nom}*\n` +
      `${livreur.nom} · ${livreur.vehicule}\n` +
      `En attente de recommandation du relais.`
    );
  }
}

// ── 4. Validation livreur par le relais → Admin doit approuver ───────────────
async function onValidationLivreur(livreur, old) {
  // Statut passe à "recommande" → Admin doit valider en final
  if (livreur.statut === 'recommande' && old.statut !== 'recommande') {
    const relais = await getRelais(livreur.relais_id);
    await notif(ADMIN_PI, 'admin', '🔴', 'validation_requise',
      '✅ VALIDATION FINALE REQUISE',
      `${livreur.nom} recommandé par ${relais?.nom}`,
      { livreur_id: livreur.id, action: 'valider_livreur' }
    );
    await wa(ADMIN_WA,
      `✅ *VALIDATION REQUISE — Livreur*\n\n` +
      `👤 ${livreur.nom} · ${livreur.vehicule}\n` +
      `Recommandé par : ${relais?.nom}\n` +
      `📌 Note : "${livreur.note_relais}"\n\n` +
      `→ Admin Multivers'Eau pour activer le compte.`
    );
  }

  // Livreur activé → notifier le livreur
  if (livreur.statut === 'actif' && old.statut !== 'actif') {
    await notif(livreur.pi_username, 'livreur', '🟡', 'compte_active',
      '🎉 Compte activé !',
      'Vous êtes maintenant livreur Multivers\'Eau. Bienvenue !',
      {}
    );
    await wa(livreur.tel_whatsapp,
      `🎉 *Bienvenue chez Multivers'Eau !*\n\n` +
      `Votre compte livreur est activé.\n` +
      `Ouvrez Pi Browser → Multivers'Eau pour commencer à livrer.`
    );
  }
}

// ── 5. Candidature Relais ─────────────────────────────────────────────────────
async function onCandidatureRelais(relais) {
  // ADMIN uniquement — c'est lui qui valide les relais en final
  await notif(ADMIN_PI, 'admin', '🔴', 'candidature_relais',
    '🏪 NOUVEAU RELAIS À VALIDER',
    `${relais.nom} · ${relais.region} · ${relais.regime}`,
    { relais_id: relais.id, action: 'valider_relais' }
  );
  await wa(ADMIN_WA,
    `🏪 *VALIDATION REQUISE — Nouveau Relais*\n\n` +
    `📍 ${relais.nom}\n🌍 ${relais.region}\n` +
    `💼 ${relais.regime}\n👤 ${relais.pi_username}\n\n` +
    `→ Admin Multivers'Eau · Section Validation.`
  );
}

// ── 6. Alerte stock bas ───────────────────────────────────────────────────────
async function onStockChange(stock, old) {
  if (stock.quantite >= old.quantite) return; // stock augmente → pas d'alerte

  const relais = await getRelais(stock.relais_id);
  const SEUIL  = await getStockMin(stock.produit_id);

  if (stock.quantite <= SEUIL && old.quantite > SEUIL) {
    // Notifier le relais concerné
    if (relais?.pi_username && relais.pi_username !== ADMIN_PI) {
      await notif(relais.pi_username, 'relais', '🟡', 'stock_bas',
        `⚠️ Stock bas — ${stock.produit_id}`,
        `${stock.quantite} unités restantes (min: ${SEUIL})`,
        { produit_id: stock.produit_id }
      );
    }

    // Admin toujours informé
    await notif(ADMIN_PI, 'admin', '🟡', 'stock_bas',
      `⚠️ Stock bas — ${relais?.nom}`,
      `${stock.produit_id} : ${stock.quantite} unités restantes`,
      { relais_id: stock.relais_id, produit_id: stock.produit_id }
    );
  }

  // Rupture totale → alerte urgente
  if (stock.quantite === 0 && old.quantite > 0) {
    await notif(ADMIN_PI, 'admin', '🔴', 'rupture',
      `🚨 RUPTURE — ${relais?.nom}`,
      `${stock.produit_id} : plus aucun stock`,
      { relais_id: stock.relais_id, produit_id: stock.produit_id }
    );
    await wa(ADMIN_WA,
      `🚨 *RUPTURE DE STOCK*\n${relais?.nom}\nProduit : ${stock.produit_id}`
    );
  }
}

// ── 7. Transaction Pi ─────────────────────────────────────────────────────────
async function onTransactionPi(tx, old) {
  if (tx.statut === 'completed' && old.statut !== 'completed') {
    const cmd = await getCommande(tx.commande_id);
    await notif(ADMIN_PI, 'admin', '🟡', 'paiement',
      '💰 Paiement Pi confirmé',
      `π${tx.montant_pi} · commande #${tx.commande_id?.slice(-6).toUpperCase()}`,
      { tx_id: tx.tx_id, montant: tx.montant_pi }
    );
  }

  // Paiement échoué → alerte critique
  if (tx.statut === 'failed') {
    await notif(ADMIN_PI, 'admin', '🔴', 'paiement_echec',
      '🚨 Paiement Pi échoué',
      `Commande #${tx.commande_id?.slice(-6).toUpperCase()} · π${tx.montant_pi}`,
      { commande_id: tx.commande_id }
    );
    await wa(ADMIN_WA,
      `🚨 *PAIEMENT PI ÉCHOUÉ*\n` +
      `Commande #${tx.commande_id?.slice(-6).toUpperCase()}\n` +
      `Montant : π${tx.montant_pi}`
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

async function notif(destinataire, role, priorite, type, titre, message, data = {}) {
  await supabase.from('notifications').insert({
    destinataire_pi: destinataire,
    role, priorite, type, titre, message,
    data,
    lu: false,
  });
}

async function wa(numero, texte) {
  if (!numero || !process.env.META_WHATSAPP_TOKEN) return;
  try {
    await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: numero.replace(/\D/g, ''),
        type: 'text',
        text: { body: texte },
      }),
    });
  } catch (e) {
    console.error('WhatsApp error:', e.message);
  }
}

const fmtFcfa = (n) => Math.round(n).toLocaleString('fr-FR') + ' F';

async function getRelais(id) {
  if (!id) return null;
  const { data } = await supabase.from('relais').select('pi_username,nom,tel_whatsapp').eq('id', id).single();
  return data;
}

async function getLivreur(id) {
  if (!id) return null;
  const { data } = await supabase.from('livreurs').select('pi_username,nom,tel_whatsapp').eq('id', id).single();
  return data;
}

async function getCommande(id) {
  if (!id) return null;
  const { data } = await supabase.from('commandes').select('*').eq('id', id).single();
  return data;
}

async function getStockMin(produitId) {
  // Seuils définis dans constants.js côté client — dupliquer côté serveur
  const SEUILS = { v1:10,v2:8,v3:8,v4:6,v5:15,v6:15,v7:8,v8:4,v9:3,c1:8,c2:6,c3:10,c4:10,c5:10,c6:6,t1:5,t2:6,t3:4 };
  return SEUILS[produitId] || 5;
}
