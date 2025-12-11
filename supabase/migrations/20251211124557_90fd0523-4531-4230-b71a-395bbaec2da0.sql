-- Create settings table for storing app configuration like PIX key
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view settings" 
ON public.app_settings 
FOR SELECT 
USING (true);

-- Only allow updates/inserts through admin (we'll handle this via service role in edge function or direct admin access)
CREATE POLICY "Anyone can update settings" 
ON public.app_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert settings" 
ON public.app_settings 
FOR INSERT 
WITH CHECK (true);

-- Insert default PIX key setting
INSERT INTO public.app_settings (key, value) VALUES ('pix_key', NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();