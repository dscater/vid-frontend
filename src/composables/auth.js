import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export async function validateToken() {
  try {
    const resp = await axios.get(apiUrl + "/authCheck"); // Laravel valida token
    return resp.data.valid;
  } catch (error) {
    return false;
  }
}
