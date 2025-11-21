import * as Yup from 'yup'

export const VALIDATION_SCHEMA = Yup.object({
  name: Yup.string()
    .trim().required("Required")
    .test("jurisdiction-exists", "Jurisdiction already exists", async function(value) {
      try {
        const res = await fetch(`/api/check_jurisdiction_name_exists`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });

        // Submission error
        if (!res.ok) {
            return this.createError({ message: "Lookup failed. Please try again later." });
        }
        
        let exists = await res.json();
        
        return !exists;
      } catch {
        return this.createError({ message: "Lookup failed. Please try again later." });
      }
    })
})