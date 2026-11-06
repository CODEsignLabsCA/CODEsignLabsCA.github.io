import { useState, type SyntheticEvent } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

type Props = {
  isSpanish: boolean;
};

const projectTypes = [
  { value: "MVP Móvil", label: { en: "Mobile MVP", es: "MVP Móvil" } },
  {
    value: "Web Enterprise",
    label: { en: "Enterprise Web", es: "Web Enterprise" },
  },
  {
    value: "Arquitectura Cloud",
    label: { en: "Cloud Architecture", es: "Arquitectura Cloud" },
  },
];

const projectPhases = [
  {
    value: "discovery_phase",
    label: {
      en: "I want to talk about my business idea",
      es: "Quiero hablar sobre mi idea de negocio",
    },
  },
  {
    value: "scale_phase",
    label: {
      en: "Optimize / Automate existing software",
      es: "Optimizar / Automatizar un software existente",
    },
  },
  {
    value: "enterprise_phase",
    label: {
      en: "Structure Enterprise Architecture",
      es: "Estructurar Arquitectura Enterprise",
    },
  },
];

export default function ContactDiagnostic({ isSpanish }: Props) {
  const [projectType, setProjectType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [phase, setPhase] = useState<
    "idle" | "submitting" | "fading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isBusy = phase === "submitting" || phase === "fading";
  const isComplete = phase === "success";

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy || isComplete) return;

    if (!projectType || !budgetRange) {
      setPhase("error");
      setErrorMessage(
        isSpanish
          ? "Seleccione el tipo de proyecto y la etapa del proyecto."
          : "Select a project type and project phase.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    setPhase("submitting");
    setErrorMessage("");

    try {
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        projectType,
        budgetRange,
        message,
        createdAt: serverTimestamp(),
      });

      setPhase("fading");
      window.setTimeout(() => setPhase("success"), 350);
    } catch (error) {
      console.error("Unable to submit contact form to Firestore:", error);
      setPhase("error");
      setErrorMessage(
        isSpanish
          ? "No se pudo enviar el mensaje. Inténtelo de nuevo más tarde."
          : "Your message could not be sent. Please try again later.",
      );
    }
  }

  return (
    <div className="contact-diagnostic font-body">
      <form
        className={`contact-diagnostic__form transition-opacity duration-300 ${
          isComplete || phase === "fading"
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        }`}
        onSubmit={handleSubmit}
        aria-hidden={isComplete}
      >
        <fieldset className="contact-diagnostic__qualifier">
          <legend>{isSpanish ? "Tipo de proyecto" : "Project type"}</legend>
          <div
            className="contact-diagnostic__chips"
            role="radiogroup"
            aria-label={isSpanish ? "Tipo de proyecto" : "Project type"}
          >
            {projectTypes.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={projectType === option.value}
                disabled={isBusy || isComplete}
                className={`contact-diagnostic__chip ${
                  projectType === option.value ? "is-selected" : ""
                }`}
                onClick={() => {
                  setProjectType(option.value);
                  if (phase === "error") setPhase("idle");
                }}
              >
                {option.label[isSpanish ? "es" : "en"]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="contact-diagnostic__qualifier">
          <legend>{isSpanish ? "Etapa del proyecto" : "Project phase"}</legend>
          <div
            className="contact-diagnostic__chips"
            role="radiogroup"
            aria-label={isSpanish ? "Etapa del proyecto" : "Project phase"}
          >
            {projectPhases.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={budgetRange === option.value}
                disabled={isBusy || isComplete}
                className={`contact-diagnostic__chip ${
                  budgetRange === option.value ? "is-selected" : ""
                }`}
                onClick={() => {
                  setBudgetRange(option.value);
                  if (phase === "error") setPhase("idle");
                }}
              >
                {option.label[isSpanish ? "es" : "en"]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="contact-diagnostic__field">
          <span>{isSpanish ? "Nombre" : "Name"}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder={isSpanish ? "Su nombre" : "Your name"}
            required
            disabled={isBusy || isComplete}
          />
        </label>

        <label className="contact-diagnostic__field">
          <span>{isSpanish ? "Correo electrónico" : "Email"}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={isSpanish ? "usted@empresa.com" : "you@company.com"}
            required
            disabled={isBusy || isComplete}
          />
        </label>

        <label className="contact-diagnostic__field">
          <span>{isSpanish ? "Requisitos técnicos" : "Technical requirements"}</span>
          <textarea
            name="message"
            rows={5}
            placeholder={
              isSpanish
                ? "¿Qué problema necesita resolver?"
                : "What problem do you need to solve?"
            }
            required
            disabled={isBusy || isComplete}
          />
        </label>

        {errorMessage && (
          <p className="contact-diagnostic__error" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="contact-submit rounded-full border-4 border-transparent px-9 py-4 font-semibold"
          disabled={isBusy || isComplete}
        >
          <span className="contact-submit-label">
            {isBusy
              ? isSpanish
                ? "ENVIANDO..."
                : "SENDING..."
              : isSpanish
                ? "CONSTRUYAMOS EL FUTURO"
                : "LET'S BUILD THE FUTURE"}
          </span>
          {isBusy && <span className="contact-diagnostic__loader" aria-hidden="true" />}
        </button>
      </form>

      <p
        className={`contact-diagnostic__success font-body transition-opacity duration-500 ${
          isComplete ? "opacity-100" : "pointer-events-none absolute opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        {isSpanish
          ? "✅ Gracias por su mensaje. Analizaremos sus requisitos técnicos."
          : "✅ Thank you for your message! We will analyze your technical requirements."}
      </p>
    </div>
  );
}
