import { member, advisor, healthHistory } from "../lib/profiles";
import { useStore } from "../lib/store";
import { Modal, Note } from "./UI";
export function Portrait({
  person = "member",
  className = "",
}: {
  person?: "member" | "advisor";
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${person === "member" ? member.name : advisor.name}, AI-generated fictional portrait`}
      className={`portrait portrait-${person} ${className}`}
    />
  );
}
export function History({ compact = false }: { compact?: boolean }) {
  return (
    <section className="health-history">
      <div className="panel-heading">
        <h2>
          {compact
            ? "The story behind the numbers"
            : "Alex’s health & wellness history"}
        </h2>
      </div>
      <p className="muted small">
        Illustrative history · All people, events, and records below are
        fictional.
      </p>
      <div className="timeline">
        {[...healthHistory]
          .reverse()
          .slice(0, compact ? 3 : undefined)
          .map((h) => (
            <article className="timeline-item" key={h.id}>
              <i />
              <small>
                {new Date(h.date + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </small>
              <h3>{h.title}</h3>
              <p>{h.detail}</p>
              <details>
                <summary>View source</summary>
                <p>
                  {h.source}
                  <br />
                  Record: {h.id}
                </p>
              </details>
            </article>
          ))}
      </div>
    </section>
  );
}
export function Profile({
  person,
  onClose,
}: {
  person: "member" | "advisor";
  onClose: () => void;
}) {
  const { state } = useStore();
  const isMember = person === "member";
  return (
    <Modal
      title={isMember ? "Meet Alex." : "Meet your advisor."}
      subtitle="Fictional demo profile · AI-generated portrait"
      onClose={onClose}
      wide
    >
      <div className="profile-intro">
        <Portrait person={person} className="portrait-large" />
        <div>
          <h3>{isMember ? member.name : advisor.name}</h3>
          <p>
            {isMember ? `${member.age} years · ${member.role}` : advisor.role}
          </p>
          <p>{isMember ? member.about : advisor.about}</p>
        </div>
      </div>
      {isMember ? (
        <>
          <div className="profile-facts">
            <div>
              <h4>Current focus</h4>
              <p>{state.goal}</p>
            </div>
            <div>
              <h4>What works for Alex</h4>
              <p>{member.preferences}</p>
            </div>
            <div>
              <h4>Reported allergy</h4>
              <p>{member.allergies}</p>
            </div>
            <div>
              <h4>Medication context</h4>
              <p>{member.medications}</p>
            </div>
          </div>
          <Note>
            This is incomplete, fictional context. It is not a verified medical
            chart or a basis for changing medication or treatment.
          </Note>
          <History />
        </>
      ) : (
        <>
          <div className="profile-facts">
            <div>
              <h4>A conversation, with context</h4>
              <p>
                Review check-ins, look at the source behind a chart point, and
                prepare questions together.
              </p>
            </div>
            <div>
              <h4>You stay in control</h4>
              <p>
                Follow-up drafts can be edited and reviewed before they update
                the member plan.
              </p>
            </div>
          </div>
          <Note>
            Maya is a demonstration persona, not a real Wellway employee. Demo
            visits do not contact anyone.
          </Note>
        </>
      )}
    </Modal>
  );
}
