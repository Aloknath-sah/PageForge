export default function LogoutButton() {
  return (
    <form
      action="/auth/signout"
      method="post"
    >
      <button
        type="submit"
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
      >
        Sign out
      </button>
    </form>
  );
}