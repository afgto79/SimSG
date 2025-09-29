# SimSG v1 – Bureaux médicaux

Application web responsive (React + Vite + TypeScript + Tailwind) pour simuler des scénarios financiers d’un projet de bureaux médicaux.

## Démarrage

```bash
# 1) Installer les dépendances
npm install

# 2) Lancer le serveur de dev
npm run dev
# Ouvrir http://localhost:5173

# 3) Exécuter les tests
npm test
```

## Scripts
- `npm run dev`: serveur Vite (hot reload)
- `npm run build`: build de production (dossier `dist/`)
- `npm run preview`: prévisualisation du build
- `npm test`: tests unitaires Vitest

## Technologies
- React 18, Vite 5, TypeScript 5
- Tailwind CSS 3
- Vitest

## Calculs (année 1, v1)
- Investissement brut = Travaux + Honoraires (8% Travaux + 8% Loyer proprio facial)
- Investissement net = Investissement brut − CIIC − PRU (clip à 0)
- Annuités (PMT) = r * P / (1 − (1+r)^−n)
- Loyers locataires = Σ(tranche_i: loyer_i * surface_i * 12 * occupation_i)
- Loyer proprio payé = loyer facial * (12 − franchise)/12
- Charges = charges_non_recup * surface
- Cash-flow = Loyers − Loyer proprio payé − Charges − Annuités
- Seuil occupation = (Loyer proprio payé + Charges + Annuités) / Loyers_100%
- Praticiens nécessaires = ceil(Seuil * Surface / 25)
- Loyer moyen (€/m²/mois) = Loyers / (Surface * 12)

## Déploiement Netlify (v1, privé)
- Build: `npm run build`
- Publish: `dist/`
- Protection par mot de passe: activer la protection du site dans le tableau de bord Netlify (Site settings → Privacy → Password).

## Format FR
- Virgule décimale, espace insécable avant €
- Arrondis: € à l’unité, % au dixième
