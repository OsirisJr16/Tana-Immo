## Tests et réalisation

### Lancer les tests

```bash
npm install
npm test
```

### Ce qui a été fait

* Analyse des extraits A, B et C dans `REPONSES.md`.
* Correction de l'API des annonces dans `listing.js` : requêtes paramétrées, pagination, limite des résultats et suppression du N+1.
* Correction du webhook de paiement dans `paymentWebhook.js` : réponse rapide, gestion des erreurs et découplage des traitements secondaires.
* Création du client CRM dans `crmClient.js` : timeout, retries, backoff exponentiel, gestion du `Retry-After` et clé d'idempotence.
* Ajout des tests pour les cas `429 → succès` et `500 → abandon après 3 tentatives`.
* Ajout des alertes proposées avant le lancement.

### Ce qui n'a pas été fait

* Une file de traitement durable (queue/outbox) n'a pas été implémentée pour garantir la reprise de l'envoi d'email et de la notification CRM en cas d'arrêt du serveur après l'accusé de réception du webhook.
* Le CRM est simulé dans les tests et aucun appel réel n'est effectué.

### Temps réellement passé

Environ **2 heures**.
