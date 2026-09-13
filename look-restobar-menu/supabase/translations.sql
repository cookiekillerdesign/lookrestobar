-- ============================================================================
-- LOOK Restobar — RU/EN translations backfill
--
-- Use this ONLY if your database was already seeded (menu_categories /
-- menu_items already have rows) BEFORE this update — seed.sql's "insert only
-- if empty" guard means it will not touch an existing database, so this file
-- adds the translations onto your existing rows instead, matched by
-- category slug and by dish name.
--
-- Safe to re-run: it always overwrites just the ru/en keys with the text
-- below and leaves everything else (photos, prices, published state, sort
-- order, any admin edits to the Romanian name/description) untouched.
--
-- Run once in Supabase Studio → SQL Editor → New query → Run, after
-- schema.sql has added the `translations` column (see schema.sql).
-- ============================================================================

-- ---- categories ------------------------------------------------------------
update public.menu_categories mc set translations = mc.translations || v.t
from (values
  ('gustari', '{"ru":{"name":"Закуски"},"en":{"name":"Starters"}}'::jsonb),
  ('salate', '{"ru":{"name":"Салаты"},"en":{"name":"Salads"}}'::jsonb),
  ('supe', '{"ru":{"name":"Супы"},"en":{"name":"Soups"}}'::jsonb),
  ('paste', '{"ru":{"name":"Паста"},"en":{"name":"Pasta"}}'::jsonb),
  ('peste', '{"ru":{"name":"Рыба и морепродукты"},"en":{"name":"Fish & Seafood"}}'::jsonb),
  ('carne', '{"ru":{"name":"Мясо и гриль"},"en":{"name":"Meat & Grill"}}'::jsonb),
  ('burgeri', '{"ru":{"name":"Бургеры"},"en":{"name":"Burgers"}}'::jsonb),
  ('platouri', '{"ru":{"name":"Блюда на компанию"},"en":{"name":"Sharing Platters"}}'::jsonb),
  ('garnituri', '{"ru":{"name":"Гарниры"},"en":{"name":"Sides"}}'::jsonb),
  ('deserturi', '{"ru":{"name":"Десерты"},"en":{"name":"Desserts"}}'::jsonb)
) as v(slug, t)
where mc.slug = v.slug;

-- ---- items (matched by category slug + exact Romanian name) ---------------
update public.menu_items mi set translations = mi.translations || v.t
from (values
  ('gustari', 'Coș cu pâine', '{"ru":{"name":"Корзинка с хлебом","description":"Ассорти свежего домашнего хлеба."},"en":{"name":"Bread Basket","description":"A selection of fresh house-made bread."}}'::jsonb),
  ('gustari', 'Baghetă cu unt și usturoi', '{"ru":{"name":"Багет с чесночным маслом","description":"Хрустящий багет, ароматное масло с чесноком."},"en":{"name":"Garlic Butter Baguette","description":"Crispy baguette with fragrant garlic butter."}}'::jsonb),
  ('gustari', 'Vânătă cu sos Parmigiano', '{"ru":{"name":"Баклажан с соусом пармиджано","description":"Баклажан, запечённые томаты черри, соус пармиджано."},"en":{"name":"Eggplant with Parmigiano Sauce","description":"Eggplant, roasted cherry tomatoes, Parmigiano sauce."}}'::jsonb),
  ('gustari', 'Ardei copt cu sos tonnato', '{"ru":{"name":"Печёный перец с соусом тоннато","description":"Печёный перец, соус тоннато, чиабатта."},"en":{"name":"Roasted Pepper with Tonnato Sauce","description":"Roasted pepper, tonnato sauce, ciabatta."}}'::jsonb),
  ('gustari', 'Tartar de ton', '{"ru":{"name":"Тартар из тунца","description":"Тунец, авокадо, огурцы, красная икра, хлопья тунца, хрустящий лук, кунжутный соус, чука."},"en":{"name":"Tuna Tartare","description":"Tuna, avocado, cucumber, red caviar, tuna flakes, crispy onion, sesame sauce, chuka salad."}}'::jsonb),
  ('gustari', 'Tartar de somon', '{"ru":{"name":"Тартар из лосося","description":"Лосось, авокадо, огурцы, красная икра, рисовые жемчужины, крабовые чипсы, кунжутный соус."},"en":{"name":"Salmon Tartare","description":"Salmon, avocado, cucumber, red caviar, rice pearls, crab chips, sesame sauce."}}'::jsonb),
  ('gustari', 'Bruschetta cu somon', '{"ru":{"name":"Брускетта с лососем","description":"Чиабатта, сырный крем, слабосолёный лосось, зелёное масло, огурцы, кунжут."},"en":{"name":"Salmon Bruschetta","description":"Ciabatta, cheese cream, cured salmon, herb oil, cucumber, sesame seeds."}}'::jsonb),
  ('gustari', 'Bruschetta cu roast beef', '{"ru":{"name":"Брускетта с ростбифом","description":"Чиабатта, соус тоннато, ростбиф, каперсы, бальзамический крем, пармиджано, кунжут."},"en":{"name":"Roast Beef Bruschetta","description":"Ciabatta, tonnato sauce, roast beef, capers, balsamic cream, Parmigiano, sesame seeds."}}'::jsonb),
  ('gustari', 'Bruschetta cu roșii cherry', '{"ru":{"name":"Брускетта с томатами черри","description":"Чиабатта, болгарский соус, запечённые томаты черри, соус песто, шпинат, зелёное масло."},"en":{"name":"Cherry Tomato Bruschetta","description":"Ciabatta, Bulgarian-style sauce, roasted cherry tomatoes, pesto, spinach, herb oil."}}'::jsonb),
  ('gustari', 'Asorti de bruschete', '{"ru":{"name":"Ассорти брускетт","description":"Брускетта с лососем, брускетта с ростбифом, брускетта с томатами черри."},"en":{"name":"Bruschetta Assortment","description":"Salmon bruschetta, roast beef bruschetta, cherry tomato bruschetta."}}'::jsonb),
  ('gustari', 'Midii pane', '{"ru":{"name":"Мидии в панировке","description":"Мясо мидий, темпура, соевый соус, чеснок, острый соус, лимон."},"en":{"name":"Breaded Mussels","description":"Mussel meat, tempura batter, soy sauce, garlic, spicy sauce, lemon."}}'::jsonb),
  ('gustari', 'Creveți pane', '{"ru":{"name":"Креветки в панировке","description":"Креветки, темпура, панко, чеснок, острый соус, лимон."},"en":{"name":"Breaded Shrimp","description":"Shrimp, tempura batter, panko, garlic, spicy sauce, lemon."}}'::jsonb),
  ('gustari', 'Calmar pane', '{"ru":{"name":"Кальмар в панировке","description":"Кальмар, панко, яйцо, острый соус, лимон."},"en":{"name":"Breaded Calamari","description":"Calamari, panko, egg, spicy sauce, lemon."}}'::jsonb),
  ('gustari', 'Crispy SeaFood', '{"ru":{"name":"Крисп сифуд","description":"Мясо мидий, темпура, соевый соус, чеснок, острый соус, лимон, креветки в панировке."},"en":{"name":"Crispy Seafood","description":"Mussel meat, tempura batter, soy sauce, garlic, spicy sauce, lemon, breaded shrimp."}}'::jsonb),
  ('gustari', 'Antipasti crudo', '{"ru":{"name":"Антипасти крудо","description":"Итальянские колбасы, оливки, маслины, гриссини."},"en":{"name":"Antipasti Crudo","description":"Italian cured meats, green and black olives, grissini."}}'::jsonb),

  ('salate', 'Salata cu creveți și mango', '{"ru":{"name":"Салат с креветками и манго","description":"Микс салата, креветки, манго, авокадо, апельсиновая заправка."},"en":{"name":"Shrimp & Mango Salad","description":"Salad mix, shrimp, mango, avocado, orange dressing."}}'::jsonb),
  ('salate', 'Salata cu ton', '{"ru":{"name":"Салат с тунцом","description":"Микс салата, тунец, запечённые томаты черри, маслины, перепелиное яйцо, кунжутный соус, кунжут."},"en":{"name":"Tuna Salad","description":"Salad mix, tuna, roasted cherry tomatoes, olives, quail egg, sesame dressing, sesame seeds."}}'::jsonb),
  ('salate', 'Salata cu somon', '{"ru":{"name":"Салат с лососем","description":"Микс салата, слабосолёный лосось, огурец, авокадо, запечённые томаты черри, кунжутный соус, кунжут."},"en":{"name":"Salmon Salad","description":"Salad mix, cured salmon, cucumber, avocado, roasted cherry tomatoes, sesame dressing, sesame seeds."}}'::jsonb),
  ('salate', 'Salata cu calmar și mango', '{"ru":{"name":"Салат с кальмаром и манго","description":"Микс салата, щупальца кальмара, манго, авокадо, апельсиновая заправка."},"en":{"name":"Calamari & Mango Salad","description":"Salad mix, calamari tentacles, mango, avocado, orange dressing."}}'::jsonb),
  ('salate', 'Salata cu vită fragedă și vinete', '{"ru":{"name":"Салат с нежной говядиной и баклажаном","description":"Микс салата, нежная говядина, грибы, печёный перец, баклажан, медово-горчичный соус, кунжут."},"en":{"name":"Tender Beef & Eggplant Salad","description":"Salad mix, tender beef, mushrooms, roasted pepper, eggplant, honey-mustard sauce, sesame seeds."}}'::jsonb),
  ('salate', 'Salata Caesar cu creveți', '{"ru":{"name":"Салат Цезарь с креветками","description":"Салат Айсберг, соус Цезарь, креветки, чеснок, томаты черри, крутоны, пармиджано."},"en":{"name":"Caesar Salad with Shrimp","description":"Iceberg lettuce, Caesar dressing, shrimp, garlic, cherry tomatoes, croutons, Parmigiano."}}'::jsonb),
  ('salate', 'Salata Caesar cu pui', '{"ru":{"name":"Салат Цезарь с курицей","description":"Салат Айсберг, куриное филе в панировке, томаты черри, крутоны, соус Цезарь, перепелиное яйцо, пармиджано."},"en":{"name":"Caesar Salad with Chicken","description":"Iceberg lettuce, breaded chicken fillet, cherry tomatoes, croutons, Caesar dressing, quail egg, Parmigiano."}}'::jsonb),
  ('salate', 'Salata Greek Garden', '{"ru":{"name":"Салат Грик Гарден","description":"Микс салата, томаты черри, перец, огурцы, красный лук, маслины, болгарская брынза, заправка."},"en":{"name":"Greek Garden Salad","description":"Salad mix, cherry tomatoes, bell pepper, cucumber, red onion, olives, Bulgarian cheese, dressing."}}'::jsonb),

  ('supe', 'Borș roșu', '{"ru":{"name":"Борщ красный","description":"Свиные рёбрышки, овощи, приправленное сало, чеснок, сметана, острый перец, чёрный хлеб."},"en":{"name":"Red Borscht","description":"Pork ribs, vegetables, seasoned lard, garlic, sour cream, hot pepper, black bread."}}'::jsonb),
  ('supe', 'Zeamă', '{"ru":{"name":"Дзама (куриный суп)","description":"Курица, морковь, болгарский перец, томаты, домашняя лапша, зелень, сметана, острый перец."},"en":{"name":"Zeamă (Chicken Soup)","description":"Chicken, carrot, bell pepper, tomato, homemade noodles, herbs, sour cream, hot pepper."}}'::jsonb),
  ('supe', 'Tom Yam', '{"ru":{"name":"Том Ям","description":"Кокосовое молоко, паста том-ям, креветки, грибы, томаты черри, зелень, рис."},"en":{"name":"Tom Yum","description":"Coconut milk, Tom Yum paste, shrimp, mushrooms, cherry tomatoes, herbs, rice."}}'::jsonb),
  ('supe', 'Supă de cașcaval cu creveți', '{"ru":{"name":"Сырный суп с креветками","description":"Овощи, сыр Чеддер, креветки, пармиджано, кунжут."},"en":{"name":"Cheese Soup with Shrimp","description":"Vegetables, Cheddar cheese, shrimp, Parmigiano, sesame seeds."}}'::jsonb),

  ('paste', 'Paste cu fructe de mare', '{"ru":{"name":"Паста с морепродуктами","description":"Паста, щупальца кальмара, креветки, черноморские мидии, мясо мидий, чеснок, сливочное масло, белое вино, томаты черри."},"en":{"name":"Seafood Pasta","description":"Pasta, calamari tentacles, shrimp, Black Sea mussels, mussel meat, garlic, butter, white wine, cherry tomatoes."}}'::jsonb),
  ('paste', 'Spaghetti alla Carbonara', '{"ru":{"name":"Спагетти Карбонара","description":"Спагетти, панчетта, яйцо, пармиджано."},"en":{"name":"Spaghetti alla Carbonara","description":"Spaghetti, pancetta, egg, Parmigiano."}}'::jsonb),
  ('paste', 'Paste cu beef', '{"ru":{"name":"Паста с говядиной","description":"Паста, вырезка говядины, томаты черри, томатная мякоть, базилик, чеснок, пармиджано."},"en":{"name":"Beef Pasta","description":"Pasta, beef tenderloin, cherry tomatoes, tomato pulp, basil, garlic, Parmigiano."}}'::jsonb),

  ('peste', 'Dorado cu legume baby', '{"ru":{"name":"Дорадо с молодыми овощами","description":"Филе дорадо, молодые овощи, эдамаме, сливочное масло, соус из каперсов."},"en":{"name":"Dorado with Baby Vegetables","description":"Dorado fillet, baby vegetables, edamame beans, butter, caper sauce."}}'::jsonb),
  ('peste', 'Somon cu sparanghel', '{"ru":{"name":"Лосось со спаржей","description":"Лосось, спаржа, цукини, соус пармиджано."},"en":{"name":"Salmon with Asparagus","description":"Salmon, asparagus, zucchini, Parmigiano sauce."}}'::jsonb),
  ('peste', 'Fructe de mare', '{"ru":{"name":"Морепродукты","description":"Щупальца кальмара, креветки, черноморские мидии, мидии с мясом, томаты черри, чеснок, сливочное масло, тимьян, белое вино, чиабатта."},"en":{"name":"Seafood Platter","description":"Calamari tentacles, shrimp, Black Sea mussels, mussel meat, cherry tomatoes, garlic, butter, thyme, white wine, ciabatta."}}'::jsonb),

  ('carne', 'File mignon cu sparanghel', '{"ru":{"name":"Филе миньон со спаржей","description":"Вырезка говядины, спаржа, молодой картофель, чеснок, сливочное масло, тимьян, соус демигласс."},"en":{"name":"Filet Mignon with Asparagus","description":"Beef tenderloin, asparagus, baby potatoes, garlic, butter, thyme, demi-glace sauce."}}'::jsonb),
  ('carne', 'Steak New York', '{"ru":{"name":"Стейк Нью-Йорк","description":"Молодой картофель, чеснок, сливочное масло, тимьян, соус демигласс."},"en":{"name":"New York Steak","description":"Baby potatoes, garlic, butter, thyme, demi-glace sauce."}}'::jsonb),
  ('carne', 'Steak Cowboy', '{"ru":{"name":"Стейк Ковбой","description":"Молодой картофель, чеснок, сливочное масло, тимьян, соус демигласс."},"en":{"name":"Cowboy Steak","description":"Baby potatoes, garlic, butter, thyme, demi-glace sauce."}}'::jsonb),
  ('carne', 'Medalion de porc cu cartof baby', '{"ru":{"name":"Медальоны из свинины с молодым картофелем","description":"Свиная вырезка, молодой картофель, грибы, чеснок, сливочное масло, тимьян, соус демигласс."},"en":{"name":"Pork Medallions with Baby Potatoes","description":"Pork tenderloin, baby potatoes, mushrooms, garlic, butter, thyme, demi-glace sauce."}}'::jsonb),
  ('carne', 'Miel cu legume', '{"ru":{"name":"Ягнёнок с овощами","description":"Мясо ягнёнка на кости, молодые овощи, соус демигласс, томаты черри, чеснок, сливочное масло, тимьян."},"en":{"name":"Lamb with Vegetables","description":"Bone-in lamb, baby vegetables, demi-glace sauce, cherry tomatoes, garlic, butter, thyme."}}'::jsonb),
  ('carne', 'Steak de pui cu legume', '{"ru":{"name":"Куриный стейк с овощами","description":"Куриная грудка, молодые овощи, сливочное масло, соус Дор Блю."},"en":{"name":"Chicken Steak with Vegetables","description":"Chicken breast, baby vegetables, butter, Dor Blue cheese sauce."}}'::jsonb),
  ('carne', 'File de rață cu piure de cartof', '{"ru":{"name":"Филе утки с картофельным пюре","description":"Филе утки, картофельное пюре, вишнёвый соус."},"en":{"name":"Duck Fillet with Mashed Potatoes","description":"Duck fillet, mashed potatoes, cherry sauce."}}'::jsonb),

  ('burgeri', 'Burger American cu carne maturată și sos BBQ', '{"ru":{"name":"Бургер Американ с выдержанной говядиной и соусом BBQ","description":"Хрустящая булочка, выдержанная говядина, томаты, сыр, маринованные огурцы, красный лук, картофель фри, соус BBQ, кетчуп."},"en":{"name":"American Burger with Aged Beef & BBQ Sauce","description":"Crispy bun, aged beef patty, tomato, cheese, pickles, red onion, fries, BBQ sauce, ketchup."}}'::jsonb),
  ('burgeri', 'Burger Krispy cu file de pui', '{"ru":{"name":"Бургер Криспи с куриным филе","description":"Хрустящая булочка, листья салата, куриное филе в панировке, чеддер, томаты, картофель фри, кетчуп."},"en":{"name":"Krispy Chicken Burger","description":"Crispy bun, lettuce, breaded chicken fillet, Cheddar, tomato, fries, ketchup."}}'::jsonb),
  ('burgeri', 'Burger BBQ Smash din coastă ruptă', '{"ru":{"name":"Бургер BBQ Смэш из тушёных рёбер","description":"Хрустящая булочка, рваная свинина, салат коулслоу, томаты, соус BBQ, картофель фри, кетчуп."},"en":{"name":"BBQ Smash Burger with Pulled Pork Ribs","description":"Crispy bun, pulled pork, coleslaw, tomato, BBQ sauce, fries, ketchup."}}'::jsonb),

  ('platouri', 'Platou Grand Steakhouse', '{"ru":{"name":"Платтер Гранд Стейкхаус","description":"Стейк Ковбой, стейк Нью-Йорк, стейк Шатобриан, печёный картофель, томаты черри, овощи гриль, трюфельный соус, соус демигласс."},"en":{"name":"Grand Steakhouse Platter","description":"Cowboy steak, New York steak, Chateaubriand steak, baked potatoes, cherry tomatoes, grilled vegetables, truffle sauce, demi-glace sauce."}}'::jsonb),
  ('platouri', 'Platou Delicatesele Mării', '{"ru":{"name":"Платтер Дары Моря","description":"Щупальца кальмара, креветки в панировке, черноморские мидии, тунец в панировке, филе дорадо, лосось, молодой картофель, брокколи, лимон, острый соус."},"en":{"name":"Sea Delicacies Platter","description":"Calamari tentacles, breaded shrimp, Black Sea mussels, breaded tuna, dorado fillet, salmon, baby potatoes, broccoli, lemon, spicy sauce."}}'::jsonb),
  ('platouri', 'Platou de carne', '{"ru":{"name":"Мясной платтер","description":"Куриная грудка на гриле, говяжья вырезка, свиная вырезка, молодой картофель, томаты черри, овощи гриль, трюфельный соус, соус демигласс."},"en":{"name":"Meat Platter","description":"Grilled chicken breast, beef tenderloin, pork tenderloin, baby potatoes, cherry tomatoes, grilled vegetables, truffle sauce, demi-glace sauce."}}'::jsonb),
  ('platouri', 'Vitello Tonnato', '{"ru":{"name":"Вителло Тоннато","description":"Вырезка говядины, микс салата, спаржа, каперсы, запечённые томаты черри, соус тоннато, трюфельное масло."},"en":{"name":"Vitello Tonnato","description":"Beef tenderloin, salad mix, asparagus, capers, roasted cherry tomatoes, tonnato sauce, truffle oil."}}'::jsonb),
  ('platouri', 'Platou de brânzeturi', '{"ru":{"name":"Сырный платтер","description":"Дор Блю, бри, пармиджано, эмменталь, виноград, сезонные фрукты, мёд."},"en":{"name":"Cheese Platter","description":"Dor Blue, brie, Parmigiano, Emmental, grapes, seasonal fruit, honey."}}'::jsonb),
  ('platouri', 'Antipasti de lux', '{"ru":{"name":"Антипасти Люкс","description":"Дор Блю, бри, пармиджано, эмменталь, виноград, сезонные фрукты, мёд, итальянские колбасы, маслины, груши, ядра грецкого ореха, гриссини."},"en":{"name":"Deluxe Antipasti","description":"Dor Blue, brie, Parmigiano, Emmental, grapes, seasonal fruit, honey, Italian cured meats, olives, pears, walnuts, grissini."}}'::jsonb),
  ('platouri', 'Platou de fructe', '{"ru":{"name":"Фруктовый платтер","description":"Ассорти сезонных фруктов."},"en":{"name":"Fruit Platter","description":"A selection of seasonal fruit."}}'::jsonb),

  ('garnituri', 'Cartof baby', '{"ru":{"name":"Молодой картофель","description":"Печёный молодой картофель с ароматными травами."},"en":{"name":"Baby Potatoes","description":"Roasted baby potatoes with aromatic herbs."}}'::jsonb),
  ('garnituri', 'Legume grill', '{"ru":{"name":"Овощи гриль","description":"Ассорти овощей на гриле."},"en":{"name":"Grilled Vegetables","description":"A selection of grilled vegetables."}}'::jsonb),
  ('garnituri', 'Sparanghel', '{"ru":{"name":"Спаржа","description":"Свежая спаржа."},"en":{"name":"Asparagus","description":"Fresh asparagus."}}'::jsonb),

  ('deserturi', 'Cheesecake San Sebastian, ciocolată/caramel', '{"ru":{"name":"Чизкейк Сан-Себастьян, шоколад/карамель","description":"Обожжённый чизкейк в стиле Сан-Себастьян."},"en":{"name":"San Sebastián Cheesecake, Chocolate/Caramel","description":"Burnt cheesecake in San Sebastián style."}}'::jsonb),
  ('deserturi', 'Cheesecake San Sebastian, mango & maracuja', '{"ru":{"name":"Чизкейк Сан-Себастьян, манго и маракуйя","description":"Обожжённый чизкейк в стиле Сан-Себастьян."},"en":{"name":"San Sebastián Cheesecake, Mango & Passion Fruit","description":"Burnt cheesecake in San Sebastián style."}}'::jsonb),
  ('deserturi', 'Cheesecake Rafaello', '{"ru":{"name":"Чизкейк Рафаэлло","description":"Чизкейк с нотками кокоса и миндаля."},"en":{"name":"Raffaello Cheesecake","description":"Cheesecake with coconut and almond notes."}}'::jsonb),
  ('deserturi', 'Tiramisu', '{"ru":{"name":"Тирамису","description":"Классический итальянский десерт с маскарпоне и кофе."},"en":{"name":"Tiramisu","description":"The classic Italian dessert with mascarpone and coffee."}}'::jsonb),
  ('deserturi', 'Mango', '{"ru":{"name":"Манго","description":"Десерт с манго."},"en":{"name":"Mango","description":"A mango-based dessert."}}'::jsonb),
  ('deserturi', 'Boabă de cafea', '{"ru":{"name":"Кофейное зерно","description":"Десерт с кофейным ароматом."},"en":{"name":"Coffee Bean","description":"A coffee-flavored dessert."}}'::jsonb),
  ('deserturi', 'Zmeură', '{"ru":{"name":"Малина","description":"Десерт с малиной."},"en":{"name":"Raspberry","description":"A raspberry-based dessert."}}'::jsonb)
) as v(category_slug, name, t)
join public.menu_categories mc2 on mc2.slug = v.category_slug
where mi.category_id = mc2.id and mi.name = v.name;
