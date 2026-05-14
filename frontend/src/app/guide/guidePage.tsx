import GuideText from "@/app/guide/guideText.mdx";

export default function Guide() {
  return (
    <div className="w-full flex flex-col items-center text-xl mb-8 text-left">
      <h1 className="text-5xl font-bold text-center sm:text-left py-8">
        Guide
      </h1>

      <GuideText />
    </div>
  );
}