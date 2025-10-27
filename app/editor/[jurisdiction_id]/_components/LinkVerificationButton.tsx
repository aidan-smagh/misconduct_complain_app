export default function LinkVerificationButton({ enabled, verified, onClick }) {
  if (!enabled) {
    // Invalid URL (including empty field)
    return (
      <button
        type="button"
        className="ml-2 px-3 py-2 w-22 rounded transition font-semibold bg-gray-100 text-gray-400 border border-gray-300"
        disabled
        title="Enter a valid URL"
      >
        Verify
      </button>
    );
  } else if (!verified) {
    // URL awaiting verification
    return (
      <button
        type="button"
        className="ml-2 px-3 py-2 w-22 rounded transition font-semibold bg-yellow-100 text-yellow-800 border border-yellow-400 cursor-pointer"
        onClick={onClick}
        title="Verify this link"
      >
        Verify
      </button>
    );
  } else {
    // Verified
    return (
      <button
        type="button"
        className="ml-2 px-3 py-2 w-22 rounded transition font-semibold bg-green-100 text-green-800 border border-green-400"
        disabled
        title="Link verified"
      >
        Verified
      </button>
    );
  }
}