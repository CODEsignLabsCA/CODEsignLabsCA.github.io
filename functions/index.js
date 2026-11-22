import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";

const whatsappAccessToken = defineSecret("WHATSAPP_ACCESS_TOKEN");
const whatsappPhoneNumberId = defineSecret("WHATSAPP_PHONE_NUMBER_ID");
const whatsappRecipient = defineSecret("WHATSAPP_TO");
const whatsappTemplateName = defineSecret("WHATSAPP_TEMPLATE_NAME");
const whatsappTemplateLanguage = defineSecret("WHATSAPP_TEMPLATE_LANGUAGE");
const graphApiVersion = defineString("WHATSAPP_GRAPH_API_VERSION", {
  default: "v23.0",
});

const projectTypeLabels = {
  MVP: "MVP móvil",
  Enterprise_Web: "Web Enterprise",
  Cloud_Architecture: "Arquitectura Cloud",
};

const phaseLabels = {
  discovery_phase: "Idea de negocio",
  scale_phase: "Optimizar o automatizar software",
  enterprise_phase: "Arquitectura Enterprise",
};

function templateText(value, maxLength = 900) {
  if (typeof value !== "string" || !value.trim()) return "No indicado";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export const notifyOnContactCreated = onDocumentCreated(
  {
    document: "contacts/{contactId}",
    secrets: [
      whatsappAccessToken,
      whatsappPhoneNumberId,
      whatsappRecipient,
      whatsappTemplateName,
      whatsappTemplateLanguage,
    ],
    timeoutSeconds: 30,
    maxInstances: 2,
    retry: true,
  },
  async (event) => {
    const contact = event.data?.data();
    if (!contact) {
      logger.error(
        "Contact document was empty; no WhatsApp notification sent.",
      );
      return;
    }

    const parameters = [
      templateText(contact.name, 120),
      templateText(contact.email, 254),
      projectTypeLabels[contact.projectType] ??
        templateText(contact.projectType, 120),
      phaseLabels[contact.budgetRange] ??
        templateText(contact.budgetRange, 120),
      templateText(contact.message),
    ];

    const url = `https://graph.facebook.com/${graphApiVersion.value()}/${whatsappPhoneNumberId.value()}/messages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappAccessToken.value()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: whatsappRecipient.value(),
          type: "template",
          template: {
            name: whatsappTemplateName.value(),
            language: { code: whatsappTemplateLanguage.value() },
            components: [
              {
                type: "body",
                parameters: parameters.map((text) => ({
                  type: "text",
                  text,
                })),
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        logger.error("WhatsApp API rejected a contact notification.", {
          status: response.status,
          contactId: event.params.contactId,
        });
        if (response.status !== 429 && response.status < 500) return;
        throw new Error(
          `WhatsApp API request failed with status ${response.status}.`,
        );
      }

      logger.info("WhatsApp contact notification sent.", {
        contactId: event.params.contactId,
      });
    } catch (error) {
      logger.error("Unable to send WhatsApp contact notification.", {
        contactId: event.params.contactId,
        error,
      });
      throw error;
    }
  },
);
