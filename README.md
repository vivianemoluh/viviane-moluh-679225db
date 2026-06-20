# 📚 Site Viviane Moluh Peyou — Guide de mise en service

Ce document récapitule **tout ce qui reste à faire** pour rendre le site public et 100% utilisable, et **comment l'administrer** au quotidien.

---

## ✅ Ce qui est déjà implémenté

### Frontend public (bilingue FR/EN)
- Accueil avec hero animé, parallax, shimmer doré sur le nom
- Biographie, Livres (liste + fiche détaillée), Chroniques (liste + détail), Agenda, Galerie, Ressources, Newsletter, Contact
- Mentions légales, Politique de confidentialité, Cookie banner
- Bascule FR/EN instantanée (toutes les chaînes traduites)
- SEO : titres, meta, OpenGraph, JSON-LD Person, sitemap.xml, robots.txt
- Animations Framer Motion (page transitions, parallax, scroll-reveal, hover livres)
- Responsive mobile / tablette / desktop

### Backend (Lovable Cloud / Supabase)
- Tables : `books`, `articles`, `events`, `gallery`, `resources`, `reviews`, `contact_messages`, `newsletter_subscribers`, `user_roles`
- Système de rôles sécurisé (`admin`, `editor`, `user`) avec fonction `has_role`
- RLS strict : seuls les **admins** peuvent modifier le contenu
- Bucket de stockage `media` (couvertures, galerie, ressources)
- Server functions sécurisées : envoi de message contact + inscription newsletter

### Panneau admin (`/admin`)
- Authentification (email + mot de passe)
- Tableau de bord avec statistiques
- CRUD complet : Livres, Chroniques, Agenda, Galerie, Ressources
- Modération : Avis lecteurs, Messages reçus
- Liste des abonnés newsletter + export CSV
- Upload d'images / fichiers directement depuis l'interface

---

## 🚀 Étapes pour passer en production

### 1️⃣ Créer le premier administrateur

Le système refuse les inscriptions publiques. Voici la procédure :

**a. Créer l'utilisateur**
- Va dans **Backend → Users** (bouton "View Backend" en haut)
- Clique sur "Add user" → entre l'email et le mot de passe de Viviane (ou le tien pour test)
- ⚠️ Coche "Auto Confirm User" pour activer le compte tout de suite

**b. Lui donner le rôle admin**
- Va dans **Backend → SQL Editor** et exécute :

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'EMAIL_DE_L_ADMIN@exemple.com';
```

**c. Se connecter**
- Va sur `https://TON-SITE.lovable.app/auth`
- Connecte-toi → tu accèdes à `/admin`

---

### 2️⃣ Activer le bucket public pour les images

Le bucket `media` est créé **mais privé** (policy de l'espace de travail). Pour que les images uploadées soient visibles publiquement :

- Va dans **Workspace Settings → Privacy & Security** (admin/owner uniquement)
- Active **"Allow public buckets"**
- Reviens ici et **dis-le-moi** → je passe le bucket `media` en public en une commande.

> Sans cette étape, les images uploadées dans le panneau admin ne s'afficheront pas sur le site public. **Étape obligatoire.**

---

### 3️⃣ Configurer Brevo (newsletter)

Le code est prêt — il manque juste 2 clés :

**a. Récupérer la clé API**
1. Va sur https://app.brevo.com → Profil → **SMTP & API** → onglet **API Keys**
2. Clique "Generate a new API key", nomme-la "Site Viviane", copie-la (`xkeysib-...`)

**b. Récupérer l'ID de liste**
1. Va dans **Contacts → Lists**
2. Crée une liste "Newsletter Viviane" (ou utilise une existante)
3. Note son ID (visible dans l'URL ou dans la colonne ID)

**c. Me communiquer les valeurs**
- Donne-moi simplement : `BREVO_API_KEY = xkeysib-...` et `BREVO_LIST_ID = 12` (par ex.)
- J'ajoute les secrets côté serveur, et chaque nouvel abonné sera automatiquement ajouté à Brevo.

> Sans Brevo : les abonnés sont quand même enregistrés dans la base et exportables en CSV depuis le panneau admin.

---

### 4️⃣ (Optionnel) Configurer l'envoi d'emails transactionnels

Pour recevoir un email à chaque nouveau message de contact ou nouvelle inscription, on peut :
- soit utiliser Brevo SMTP (déjà connecté) — dis-moi si tu veux que je l'ajoute
- soit consulter les messages directement dans **Admin → Messages**

---

### 5️⃣ Publier le site

1. Ouvre **Project Settings → Domains**
2. Clique sur **Publish** (le site sera en `viviane-moluh-peyou.lovable.app` ou similaire)
3. Pour ton propre domaine (ex: `vivianemoluhpeyou.com`) : ajoute-le dans Domains et suis les instructions DNS

---

## 📂 Où vont les images ?

| Type | Bucket | Dossier | Upload |
|---|---|---|---|
| Couvertures de livres | `media` | `covers/` | Admin → Livres → champ "Couverture" |
| Images de chroniques | `media` | `articles/` | Admin → Chroniques → champ "Image de couverture" |
| Photos de la galerie | `media` | `gallery/` | Admin → Galerie → "Ajouter une photo" |
| Ressources (PDF, etc.) | `media` | `resources/` | Admin → Ressources → champ "Fichier" |

**Tout est stocké dans Lovable Cloud / Supabase Storage** — pas besoin d'un service externe (Cloudinary, AWS S3, etc.).

---

## 🔧 SQL utile (à coller dans Backend → SQL Editor au besoin)

### Promouvoir un utilisateur en admin
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'email@exemple.com';
```

### Retirer le rôle admin
```sql
DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'email@exemple.com')
  AND role = 'admin';
```

### Lister tous les admins
```sql
SELECT u.email, ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

### Voir les derniers abonnés newsletter
```sql
SELECT email, first_name, source, created_at
FROM public.newsletter_subscribers
ORDER BY created_at DESC
LIMIT 50;
```

---

## ❓ Checklist finale avant de partager le site

- [ ] Premier admin créé + rôle attribué (étape 1)
- [ ] Bucket `media` passé en public (étape 2)
- [ ] Brevo configuré (étape 3) — optionnel mais recommandé
- [ ] Au moins 1 livre, 1 chronique, 1 événement saisis depuis l'admin
- [ ] Photos de couverture uploadées
- [ ] Photo de Viviane ajoutée sur la page Biographie
- [ ] Test du formulaire de contact (depuis le site → vérifier dans Admin → Messages)
- [ ] Test de l'inscription newsletter
- [ ] Publication du site (étape 5)
- [ ] (Optionnel) Domaine personnalisé connecté

---

## 🆘 Problèmes fréquents

**« Je ne peux pas me connecter à /admin »**
→ L'utilisateur existe mais n'a pas le rôle admin. Exécute le SQL de l'étape 1b.

**« Mes images ne s'affichent pas sur le site public »**
→ Le bucket `media` est encore privé. Voir étape 2.

**« L'inscription newsletter affiche un succès mais Brevo ne reçoit rien »**
→ Les secrets `BREVO_API_KEY` / `BREVO_LIST_ID` ne sont pas encore renseignés. Voir étape 3.

**« Erreur 401 dans la console »**
→ La session a expiré, déconnecte-toi puis reconnecte-toi depuis `/auth`.

---

Besoin d'aide ? Dis-moi simplement à quelle étape tu es coincé, et je résous tout de suite. 🌿
