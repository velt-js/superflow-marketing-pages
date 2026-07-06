"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./SolutionSection.module.css";

/** One Agent Team pill, prepared server-side (icon JSX, accent class, reveal delay). */
export interface AgentPill {
  id: string;
  label: string;
  accentClassName: string;
  icon: ReactNode;
  revealStyle: CSSProperties;
}

/** Latest agent activation; tick increments so repeats of an agent re-fire. */
interface AgentActivation {
  agentId: string | null;
  tick: number;
}

/* Split contexts: the setter is stable so publishers (the toast) can depend
   on it without re-running effects every time the activation state changes. */
const AgentActivationStateContext = createContext<AgentActivation>({
  agentId: null,
  tick: 0,
});
const AgentActivationApiContext = createContext<
  (agentId: string | null) => void
>(() => undefined);

/**
 * Context provider connecting the review toast to the Agent Team pills.
 * Wraps the flow diagram; holds which agent was last "activated" by a toast.
 */
export function SolutionSectionAgentProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [activation, setActivation] = useState<AgentActivation>({
    agentId: null,
    tick: 0,
  });

  const activate = useCallback((agentId: string | null) => {
    setActivation((previous) => ({ agentId, tick: previous.tick + 1 }));
  }, []);

  return (
    <AgentActivationApiContext.Provider value={activate}>
      <AgentActivationStateContext.Provider value={activation}>
        {children}
      </AgentActivationStateContext.Provider>
    </AgentActivationApiContext.Provider>
  );
}

/**
 * Returns the stable activation dispatcher used by the cycling toast.
 */
export function useAgentActivate(): (agentId: string | null) => void {
  return useContext(AgentActivationApiContext);
}

/**
 * The Agent Team pill list. Each pill keeps its entrance-reveal styling and
 * plays a one-shot accent pulse whenever the matching finding toast lands.
 */
export default function SolutionSectionAgentPills({
  pills,
}: {
  pills: AgentPill[];
}): ReactNode {
  const activation = useContext(AgentActivationStateContext);
  const [handledTick, setHandledTick] = useState(0);

  return (
    <>
      {pills.map((pill) => {
        const isPulsing =
          activation.agentId === pill.id && activation.tick > handledTick;
        const pillClassName = [
          styles.pill,
          pill.accentClassName,
          isPulsing ? styles.pillPulse : "",
        ]
          .filter(Boolean)
          .join(" ");

        /* Outer wrapper carries the once-only entrance reveal; the inner
           pill carries the transform-only activation bounce. Splitting the
           two animations across elements prevents the bounce class toggle
           from re-running the reveal (which would flash the pill hidden). */
        return (
          <span
            key={pill.id}
            className={`${styles.pillReveal} ${styles.revealItem}`}
            style={pill.revealStyle}
          >
            <span
              className={pillClassName}
              onAnimationEnd={() => setHandledTick(activation.tick)}
            >
              {pill.icon}
              {pill.label}
            </span>
          </span>
        );
      })}
    </>
  );
}
