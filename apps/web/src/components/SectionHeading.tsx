type Props = { title: string; subtitle?: string; center?: boolean };

export default function SectionHeading({ title, subtitle, center = true }: Props) {
  return (
    <div className={`${center ? "text-center" : ""} mb-10`}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
      {subtitle ? <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p> : null}
    </div>
  );
}
