import { Redirect } from 'expo-router';

/** Legacy route — premium auth lives on `welcome` + `otp`. */
export default function LoginRedirect() {
  return <Redirect href="/(auth)/welcome" />;
}
