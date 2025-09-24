import { AddCardForm } from "@/components/AddCardForm";
import Header from "@/components/Header";

const AddCard = () => {
  return (
    <>
    <main className="min-h-screen bg-white">
      <Header />
      <div className="w-full h-full max-w-5xl mx-auto">
        <AddCardForm />
      </div>
    </main>
    </>
  );
};

export default AddCard;
