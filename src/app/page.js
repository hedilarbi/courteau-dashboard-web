import Image from "next/image";
import logo from "../../public/logo.png";
import Spinner from "@/components/spinner/Spinner";

export default function Home() {
  return (
    <main className="  max-h-screen h-screen w-screen">
      <div className="flex w-full h-full bg-black justify-center items-center ">
        <div className="flex flex-col items-center space-y-4">
          <Image src={logo} alt="logo" width={250} height={100} />
          <Spinner />
        </div>
      </div>
    </main>
  );
}
