
import { createClient } from '@supabase/supabase-js';

// تم التحديث باستخدام البيانات المقدمة من قبل المستخدم
const supabaseUrl = 'https://ldgygbjuyszlqoyqbvmh.supabase.co';
const supabaseAnonKey = 'sb_publishable_-GrMaGexwYIR2w0DrHwycQ_UcuacDTU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
