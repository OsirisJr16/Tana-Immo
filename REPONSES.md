Extrait A - Composant React de liste d'annonces 

| Problème                                               | Gravité  | Correction                                               |
| ------------------------------------------------------ | -------- | -------------------------------------------------------- |
| `useEffect` sans tableau  dépendances                           | Critique | Ajouter `[city]` pour éviter les appels à chaque rendu   |
| Risque de boucle de requêtes                           | Critique | Corriger la logique du `useEffect`                       |
| `city` n'est pas encodée dans l'URL , si `city` contient des espaces ou des caractères spéciaux l'URL peut être incorrecte                 | Moyenne  | Utilisation  `encodeURIComponent` ou `URLSearchParams`       |
| Pas de gestion d'erreur pour le http/fetch              | Haute    | Vérifier `response.ok` et gérer les erreurs avec `catch` |
|`price.toLocaleString()` peut provoquer une erreur si price `null` ou `undefined` | Moyenne  | Vérifier et valider les données avant affichage          |
| Les `<li>` n'ont pas de `key`(react demande une `key` pour lister les éléments d'une liste )                         | Faible   | Ajouter `key={l.id}`                                     |
| `loading` peut rester bloqué sur  `true`       | Moyenne  | Utiliser `finally` pour réinitialiser `loading`          |

Extrait B - Route API de recherche d'annonces (Express + PostgreSQL)

| Problème                                                        | Gravité  | Correction proposée                                                    |
| --------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| Injection SQL via `city` interpolée directement dans la requête | Critique | Utilisation d'une requête paramétrée avec `$1`                              |
| Absence de pagination malgré le paramètre `page`                | Haute    | Valider `page` et utiliser `LIMIT/OFFSET`                              |
| N+1 requêtes pour les agences et les photos                     | Critique | Utiliser des `JOIN` et/ou agrégations SQL                              |
| Absence de gestion des erreurs PostgreSQL                       | Haute    | Entourer la logique d'un `try/catch` et retourner une erreur générique |
| Absence de limite sur le nombre de résultats                    | Haute    | Définir une taille de page maximale                                    |
| Utilisation de `SELECT *`                                       | Moyenne  | Sélectionner explicitement les colonnes nécessaires                    |


Extrait C - Webhook de confirmation de paiement

| Problème                                                                                                     | Sévérité | Correction                                                                                |
| ------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------- |
| L'appel CRM peut prendre 2 à 8 secondes et s'ajoute aux autres opérations avant le `200`                     | Critique | Répondre rapidement et traiter les actions secondaires de manière asynchrone              |
| En cas de retry, le même événement peut être traité plusieurs fois, notamment l'email et la notification CRM | Critique | Mettre en place une idempotence basée sur un identifiant unique fourni par le prestataire |
| Pas de gestion des erreurs                                                                                   | Haute    | Ajouter un `try/catch` et gérer les erreurs de traitement                                 |
| Le traitement du webhook dépend directement des services externes (email, CRM)                               | Haute    | Découpler les traitements secondaires du webhook avec une file/job asynchrone             |
| Pas de vérification d'authenticité du webhook                                                                | Moyenne  | Vérifier la signature du prestataire **si ce mécanisme est fourni**                       |
