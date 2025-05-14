-- Add sample subscription plans
INSERT INTO subscription_plans (price_id, name, description, amount, currency, interval)
VALUES
  ('price_basic', 'Basic Plan', 'Essential ESG reporting features', 9.99, 'usd', 'month'),
  ('price_standard', 'Standard Plan', 'Comprehensive ESG reporting and analysis', 29.99, 'usd', 'month'),
  ('price_premium', 'Premium Plan', 'Advanced ESG analytics and custom reporting', 99.99, 'usd', 'month'),
  ('price_basic_annual', 'Basic Annual Plan', 'Essential ESG reporting features (annual)', 99.99, 'usd', 'year'),
  ('price_standard_annual', 'Standard Annual Plan', 'Comprehensive ESG reporting and analysis (annual)', 299.99, 'usd', 'year'),
  ('price_premium_annual', 'Premium Annual Plan', 'Advanced ESG analytics and custom reporting (annual)', 999.99, 'usd', 'year'),
  ('price_enterprise', 'Enterprise Plan', 'Full-featured ESG management platform with dedicated support', 499.99, 'usd', 'month'),
  ('price_enterprise_annual', 'Enterprise Annual Plan', 'Full-featured ESG management platform with dedicated support (annual)', 4999.99, 'usd', 'year')
ON CONFLICT (price_id) DO NOTHING;
