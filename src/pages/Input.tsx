import { Input } from "@/components/ui/input";

const InputPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1A2E] text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome! Ready to continue your journey?</h1>
      <p className="mb-4 text-lg text-white/80">Let us know how you're feeling or what you'd like to do next.</p>
      <Input placeholder="Type your thoughts or goals..." className="max-w-md w-full mb-4" />
      {/* Add more UI/UX as needed */}
    </div>
  );
};

export default InputPage; 