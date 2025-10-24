import type { FormikHelpers } from "formik";

// Wrap a Formik onSubmit to automatically reset the form when the handler resolves without throwing
export function withAutoReset<T>(
  submit: (values: T, formikHelpers: FormikHelpers<T>) => any | Promise<any>
) {
  return async (values: T, helpers: FormikHelpers<T>) => {
    const result = await Promise.resolve(submit(values, helpers));
    try {
      // Defer slightly to allow any toasts/modals to read current values
      setTimeout(() => helpers.resetForm(), 0);
    } catch {}
    return result;
  };
}
