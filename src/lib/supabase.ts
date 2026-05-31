import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gxhqzweidydcqlyzuprn.supabase.co";
const supabaseKey = "sb_publishable_836uQOy5k85MumT7Tw9kwA_67UGbqWF";

export const supabase = createClient(supabaseUrl, supabaseKey);