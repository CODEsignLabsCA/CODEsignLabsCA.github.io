# WhatsApp notifications for contact requests

When the public contact form creates a document in `contacts`, the
`notifyOnContactCreated` Cloud Function sends a WhatsApp template message to the
configured recipient. The browser never receives the WhatsApp access token.

## One-time setup

1. In Meta Business, enable the WhatsApp Cloud API, add a sending phone number,
   and create an approved **Utility** template. Use the name `new_contact_request`
   and language `es`. Its body must contain these five parameters in order:

   ```text
   Nueva solicitud de presupuesto.
   Nombre: {{1}}
   Email: {{2}}
   Proyecto: {{3}}
   Etapa: {{4}}
   Mensaje: {{5}}
   ```

   Supply example values for all five parameters when submitting the template.
   The template name and language can instead be set to other values using the
   secrets below.

2. Ensure the Firebase project `codesignlabs-portfolio` is on the Blaze plan and
   that Cloud Functions, Eventarc, Cloud Build, and Secret Manager APIs can be
   enabled for it. Cloud Functions deployments require billing to be linked.

3. From the repository root, set each secret interactively. Do not commit these
   values or put them in frontend `PUBLIC_` environment variables:

   ```sh
   firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN --project codesignlabs-portfolio
   firebase functions:secrets:set WHATSAPP_PHONE_NUMBER_ID --project codesignlabs-portfolio
   firebase functions:secrets:set WHATSAPP_TO --project codesignlabs-portfolio
   firebase functions:secrets:set WHATSAPP_TEMPLATE_NAME --project codesignlabs-portfolio
   firebase functions:secrets:set WHATSAPP_TEMPLATE_LANGUAGE --project codesignlabs-portfolio
   ```

   Use a long-lived Meta system-user access token, the phone number ID shown in
   the WhatsApp API setup (not the displayed phone number), and the destination
   WhatsApp number in international format with digits only. The template name
   and language must exactly match the approved Meta template.

4. Deploy with:

   ```sh
   pnpm dlx firebase-tools deploy --project codesignlabs-portfolio --only functions
   ```

   The GitHub Actions deployment also publishes Functions; its existing
   `FIREBASE_TOKEN` must be authorized for this project and the secrets above
   must already exist.

## Notes

- The function currently uses Graph API version `v23.0`. Update the default for
  `WHATSAPP_GRAPH_API_VERSION` in `index.js` when moving to another supported
  Meta version.
- The default Functions region is `us-central1`. For best performance and to
  avoid cross-region traffic, align the function region with the Firestore
  database location before deploying.
- Temporary send failures are retried by Cloud Functions; permanent API errors
  are logged without retrying. Since a network failure can happen after Meta
  accepted a message, a retry may result in a duplicate.
- Review Firestore Security Rules and configure Firebase App Check before
  production use. The contact collection is written from a public form, and
  unprotected writes could cause unwanted notifications or costs.
