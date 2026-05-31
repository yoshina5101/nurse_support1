import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
        ログアウト
      </button>
    </form>
  );
}
