export function JoinInterviewLink({
  href,
  variant = "text",
}: {
  href: string;
  variant?: "text" | "button";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={variant === "button" ? "btn-primary" : "text-sm font-medium text-accent hover:underline"}
    >
      Join interview
    </a>
  );
}
