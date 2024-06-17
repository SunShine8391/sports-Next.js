import Predictions from "@/components/dashboard-ui/predictions";
import Navbar from "@/components/layout/navbar";
import { getPredictions, getProfile } from "@/lib/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["predictions"],
    queryFn: getPredictions,
  });

  await queryClient.prefetchQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  return (
    <div className="p-8">
      <Predictions />
    </div>
  );
};

export default Dashboard;
