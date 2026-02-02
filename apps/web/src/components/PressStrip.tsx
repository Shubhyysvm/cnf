import Container from "./Container";

const logos = [
  { name: "Nature Daily", src: "https://images.unsplash.com/photo-1520975922284-7b6836f1d4b6?w=400&q=60" },
  { name: "Green Life", src: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=400&q=60" },
  { name: "Wellness", src: "https://images.unsplash.com/photo-1520975624749-5f9f0eec6c0d?w=400&q=60" },
  { name: "Eco Times", src: "https://images.unsplash.com/photo-1520975893929-ef9b28ad5cf9?w=400&q=60" },
];

export default function PressStrip() {
  return (
    <div className="bg-white">
      <Container className="py-8">
        <div className="text-center text-gray-500 text-sm mb-4">As seen in</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 opacity-80">
          {logos.map((l) => (
            <div key={l.name} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </Container>
    </div>
  );
}
