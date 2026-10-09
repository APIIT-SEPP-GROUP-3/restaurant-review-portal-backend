# Role management

The backend enforces these responsibilities through JWT authentication, current database roles, and restaurant ownership checks. Visitors can browse without a database role. Registration always creates a CUSTOMER. Protected requests reject inactive users/roles and use the user's current role, including when an older token is presented.

| Function | ADMIN | MODERATOR | RESTAURANT_OWNER | CUSTOMER |
| --- | --- | --- | --- | --- |
| Browse restaurants, meals, approved reviews | Yes | Yes | Yes | Yes |
| Create restaurants and assign owners | Yes | No | No | No |
| Edit restaurant details | All | No | Assigned only | No |
| Activate/deactivate restaurants | Yes | No | No | No |
| Create/view/edit/deactivate users; assign roles | Yes | No | No | No |
| Manage menu categories, items, prices and images | No | No | Assigned only | No |
| Submit restaurant/meal reviews and ratings | No | No | No | Yes |
| Comment on other customers' approved reviews | No | No | No | Yes |
| Post official responses | No | No | Assigned only | No |
| Approve/reject reviews, comments, owner responses | No | Yes | No | No |
| View own reviews and moderation status | No | No | No | Yes |

## API changes

All paths start with `/api`. ADMIN restaurant creation remains `POST /restaurants`, but now requires `ownerId` identifying an active RESTAURANT_OWNER. `PUT /restaurants/:id` edits details for admins or the assigned owner; it rejects ownership and status fields. Restaurant categories at `/restaurant-categories` remain admin-managed system taxonomy; assignment of those categories to a restaurant is owner-only.

New ADMIN endpoints:

- `GET /admin/roles`: available roles.
- `POST /admin/users`: firstName, lastName, email, password, role.
- `GET /admin/users?page=1&limit=25` and `GET /admin/users/:id`: user information without password hashes.
- `PATCH /admin/users/:id`: firstName, lastName, email, role and/or isActive. Reassign a user's restaurants before changing them away from RESTAURANT_OWNER. Admins cannot deactivate or demote themselves.
- `GET /admin/restaurants?page=1&limit=25`: includes active and inactive restaurants and owner information.
- `PATCH /admin/restaurants/:id/owner`: `{ "ownerId": 123 }`; requires an active owner account.
- `PATCH /admin/restaurants/:id/status`: `{ "status": "INACTIVE" }` or ACTIVE.
- `GET /admin/overview`: system-wide user, restaurant, review and comment counts.

New account endpoints:

- `GET /me/restaurants`: assigned restaurants, including inactive ones, for owners.
- `GET /me/reviews`: the customer's own reviews, including pending/rejected status and rejection reasons.

Owners can `DELETE /menu-categories/:id` and `DELETE /menu-items/:id`. Nonempty categories return 409 until their items are moved/deleted. Items referenced by reviews return 409 to preserve review history; use the existing availability endpoint to retire these meals.

Existing menu/category/image mutations now require RESTAURANT_OWNER and matching ownership. Existing moderation endpoints now require MODERATOR. ADMIN cannot submit comments. Owner responses use the same comment endpoint as customer comments, with restaurant ownership verified. Customers cannot comment on their own reviews. Replies must target an approved comment on the same review.

## Moderation history

Reviews, comments and owner responses begin PENDING and become publicly visible only after approval. Only approved reviews affect rating averages. Rejections require a reason. Each decision stores its status, moderator user ID, timestamp and rejection reason; finalized decisions cannot be changed through the API. Conditional updates prevent simultaneous decisions from overwriting each other.

`GET /moderation/history?page=1&limit=25` returns finalized reviews and comments, with each list paginated separately. Existing `/moderation/reviews` and `/moderation/comments` also accept a `status` filter for APPROVED or REJECTED records. This is one retained decision per posting, not a log of multiple revisions.

No schema migration is required. The frontend must adopt the new endpoints and remove admin moderation/menu controls and owner restaurant creation controls.
