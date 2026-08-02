import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = (await import("npm:@supabase/supabase-js@2.57.4")).createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create or get demo user
    const demoEmail = "demo@bfraaga.bf";
    const demoPassword = "demo123456";

    let userId: string;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === demoEmail);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user!.id;
    }

    // Create profile if not exists
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (!existingProfile) {
      await supabase.from("profiles").insert({
        id: userId,
        email: demoEmail,
        full_name: "Utilisateur Demo",
        role: "seller",
        city: "Ouagadougou",
        country: "Burkina Faso",
      });
    }

    // Create demo sellers
    const sellers = [
      {
        user_id: userId,
        business_name: "Tech Burkina",
        slug: "tech-burkina",
        description: "Vente de téléphones, ordinateurs et accessoires électroniques. Garantie 6 mois sur tous nos produits.",
        logo_url: "https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&w=200",
        address: "Avenue Kwame Nkrumah, Secteur 15",
        city: "Ouagadougou",
        country: "Burkina Faso",
        phone: "+226 71 64 48 00",
        whatsapp: "+22671644800",
        business_hours: "Lun-Sam: 8h-19h",
        is_verified: true,
        is_active: true,
        total_sales: 42,
        rating: 4.5,
        review_count: 12,
      },
      {
        user_id: userId,
        business_name: "Mode Africaine Elite",
        slug: "mode-africaine-elite",
        description: "Pagnes, tenues traditionnelles et modernes en wax et bogolan. Fait-main par nos artisans locaux.",
        logo_url: "https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&w=200",
        address: "Rue du Commerce, Secteur 10",
        city: "Ouagadougou",
        country: "Burkina Faso",
        phone: "+226 71 64 48 00",
        whatsapp: "+22671644800",
        business_hours: "Lun-Sam: 9h-18h",
        is_verified: true,
        is_active: true,
        total_sales: 78,
        rating: 4.8,
        review_count: 24,
      },
      {
        user_id: userId,
        business_name: "Agro Sahel",
        slug: "agro-sahel",
        description: "Produits agricoles frais, semences certifiées et matériel agricole. Livraison dans tout le Burkina.",
        logo_url: "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=200",
        address: "Route de Kaya, KM 5",
        city: "Ouagadougou",
        country: "Burkina Faso",
        phone: "+226 71 64 48 00",
        whatsapp: "+22671644800",
        business_hours: "Lun-Sam: 6h-17h",
        is_verified: true,
        is_active: true,
        total_sales: 35,
        rating: 4.2,
        review_count: 8,
      },
      {
        user_id: userId,
        business_name: "Services Pro Ouaga",
        slug: "services-pro-ouaga",
        description: "Services professionnels : plomberie, électricité, menuiserie, nettoyage et informatique. Devis gratuit.",
        logo_url: "https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg?auto=compress&w=200",
        address: "Avenue du Progrès, Secteur 25",
        city: "Ouagadougou",
        country: "Burkina Faso",
        phone: "+226 71 64 48 00",
        whatsapp: "+22671644800",
        business_hours: "Lun-Dim: 7h-20h",
        is_verified: true,
        is_active: true,
        total_sales: 56,
        rating: 4.6,
        review_count: 18,
      },
      {
        user_id: userId,
        business_name: "Maison & Déco BF",
        slug: "maison-deco-bf",
        description: "Meubles, décoration intérieure, ustensiles de cuisine et articles ménagers. Qualité et prix bas.",
        logo_url: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&w=200",
        address: "Rue du Marché, Secteur 5",
        city: "Ouagadougou",
        country: "Burkina Faso",
        phone: "+226 71 64 48 00",
        whatsapp: "+22671644800",
        business_hours: "Lun-Sam: 8h-18h",
        is_verified: true,
        is_active: true,
        total_sales: 63,
        rating: 4.4,
        review_count: 15,
      },
    ];

    for (const seller of sellers) {
      const { data: existing } = await supabase.from("sellers").select("id").eq("slug", seller.slug).maybeSingle();
      if (!existing) {
        await supabase.from("sellers").insert(seller);
      }
    }

    // Get seller IDs
    const { data: allSellers } = await supabase.from("sellers").select("id, slug");
    const sellerMap = new Map(allSellers?.map((s: any) => [s.slug, s.id]) ?? []);

    // Get category IDs
    const { data: allCats } = await supabase.from("categories").select("id, slug");
    const catMap = new Map(allCats?.map((c: any) => [c.slug, c.id]) ?? []);

    const products = [
      {
        seller_id: sellerMap.get("tech-burkina"),
        category_id: catMap.get("electronique-informatique"),
        title: "iPhone 13 Pro Max 256GB",
        slug: "iphone-13-pro-max-256gb",
        description: "iPhone 13 Pro Max en excellent état. Écran Super Retina XDR 6.7\", puce A15 Bionic, triple caméra 12MP. Batterie 92% de santé. Livré avec chargeur et coque.",
        price: 485000,
        compare_price: 550000,
        currency: "XOF",
        stock: 3,
        condition: "used",
        sku: "IPH-13PM-256",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 8,
        rating: 4.5,
        review_count: 3,
        image: "https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("tech-burkina"),
        category_id: catMap.get("electronique-informatique"),
        title: "Samsung TV 55\" 4K Smart TV",
        slug: "samsung-tv-55-4k-smart",
        description: "Téléviseur Samsung 55 pouces Ultra HD 4K. Smart TV avec WiFi, Netflix, YouTube. Qualité d'image exceptionnelle. Comme neuf, utilisé 6 mois seulement.",
        price: 275000,
        compare_price: 320000,
        currency: "XOF",
        stock: 2,
        condition: "used",
        sku: "SAM-TV-55",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 5,
        rating: 4.7,
        review_count: 2,
        image: "https://images.pexels.com/photos/5490306/pexels-photo-5490306.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("tech-burkina"),
        category_id: catMap.get("electronique-informatique"),
        title: "HP Laptop ProBook 450 G8",
        slug: "hp-laptop-probook-450-g8",
        description: "Ordinateur portable HP ProBook 450 G8. Intel Core i5 11ème gen, 16GB RAM, 512GB SSD. Écran 15.6\" Full HD. Parfait pour le travail et les études. Garantie 1 an.",
        price: 385000,
        compare_price: 450000,
        currency: "XOF",
        stock: 4,
        condition: "new",
        sku: "HP-PB-450",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 12,
        rating: 4.8,
        review_count: 5,
        image: "https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("mode-africaine-elite"),
        category_id: catMap.get("mode-vetements"),
        title: "Pagne Wax Hollandais 6 Yards",
        slug: "pagne-wax-hollandais-6-yards",
        description: "Authentique wax hollandais premium. Motifs traditionnels africains aux couleurs vives. 6 yards de qualité supérieure. Parfait pour robes, pagne et tenues de cérémonie.",
        price: 35000,
        currency: "XOF",
        stock: 15,
        condition: "new",
        sku: "WAX-HOL-6Y",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 32,
        rating: 4.9,
        review_count: 8,
        image: "https://images.pexels.com/photos/1884583/pexels-photo-1884583.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("mode-africaine-elite"),
        category_id: catMap.get("mode-vetements"),
        title: "Boubou Homme Brodé Premium",
        slug: "boubou-homme-brode-premium",
        description: "Boubou homme traditionnel brodé à la main. Tissu léger et confortable pour les cérémonies et les prières du vendredi. Disponible en plusieurs tailles. Livraison gratuite.",
        price: 55000,
        compare_price: 75000,
        currency: "XOF",
        stock: 8,
        condition: "new",
        sku: "BOB-HOM-001",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 18,
        rating: 4.7,
        review_count: 6,
        image: "https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("mode-africaine-elite"),
        category_id: catMap.get("mode-vetements"),
        title: "Sandales Cuir Artisanal",
        slug: "sandales-cuir-artisanal",
        description: "Sandales en cuir véritable faites main par nos artisans. Semelle confortable et durable. Design élégant pour homme et femme. Plusieurs coloris disponibles.",
        price: 18000,
        currency: "XOF",
        stock: 20,
        condition: "new",
        sku: "SAN-CUI-001",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 10,
        rating: 4.3,
        review_count: 4,
        image: "https://images.pexels.com/photos/1123982/pexels-photo-1123982.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("agro-sahel"),
        category_id: catMap.get("agriculture-elevage"),
        title: "Semences Maïs Hybride 50kg",
        slug: "semences-mais-hybride-50kg",
        description: "Semences de maïs hybride de haute qualité. Rendement élevé, résistant à la sécheresse. 50kg pour 1 hectare. Certifiées par l'INERA. Livraison gratuite dans la région de Ouagadougou.",
        price: 125000,
        compare_price: 150000,
        currency: "XOF",
        stock: 25,
        condition: "new",
        sku: "SEM-MAIS-50",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 15,
        rating: 4.6,
        review_count: 3,
        image: "https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("agro-sahel"),
        category_id: catMap.get("agriculture-elevage"),
        title: "Engrais NPK 15-15-15 50kg",
        slug: "engrais-npk-15-15-15-50kg",
        description: "Engrais composé NPK 15-15-15 de haute qualité. Idéal pour toutes les cultures : céréales, légumes, coton. Sac de 50kg. Prix compétitif pour les agriculteurs.",
        price: 45000,
        currency: "XOF",
        stock: 40,
        condition: "new",
        sku: "ENG-NPK-50",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 8,
        rating: 4.4,
        review_count: 2,
        image: "https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("maison-deco-bf"),
        category_id: catMap.get("maison-decoration"),
        title: "Canapé 3 Places en Tissu",
        slug: "canape-3-places-tissu",
        description: "Canapé 3 places moderne et confortable. Tissu résistant de haute qualité. Structure en bois massif. Couleur beige. Idéal pour salon et salle de séjour. Livraison incluse.",
        price: 185000,
        compare_price: 220000,
        currency: "XOF",
        stock: 5,
        condition: "new",
        sku: "CAN-3P-TIS",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 7,
        rating: 4.5,
        review_count: 3,
        image: "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("maison-deco-bf"),
        category_id: catMap.get("maison-decoration"),
        title: "Réfrigérateur 2 Portes 320L",
        slug: "refrigerateur-2-portes-320l",
        description: "Réfrigérateur double porte 320 litres. Classe énergétique A+. Congélateur 4 étoiles. Faible consommation électrique. Parfait pour famille nombreuse. Garantie 2 ans.",
        price: 295000,
        compare_price: 350000,
        currency: "XOF",
        stock: 3,
        condition: "new",
        sku: "REF-2P-320",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 9,
        rating: 4.6,
        review_count: 4,
        image: "https://images.pexels.com/photos/3637728/pexels-photo-3637728.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("tech-burkina"),
        category_id: catMap.get("auto-moto"),
        title: "Moto Yamaha YBR 125 2022",
        slug: "moto-yamaha-ybr-125-2022",
        description: "Moto Yamaha YBR 125cc, année 2022. Très bon état, 8 500 km au compteur. Documents à jour. Essence économique. Idéale pour la ville et les livraisons. Essai possible.",
        price: 685000,
        currency: "XOF",
        stock: 1,
        condition: "used",
        sku: "MOT-YBR-125",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 6,
        rating: 4.2,
        review_count: 2,
        image: "https://images.pexels.com/photos/262666/pexels-photo-262666.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("maison-deco-bf"),
        category_id: catMap.get("maison-decoration"),
        title: "Kit Ustensiles Cuisine Inox 12pcs",
        slug: "kit-ustensiles-cuisine-inox-12pcs",
        description: "Kit complet de 12 ustensiles de cuisine en inox alimentaire. Cuillères, spatules, louche, écumoire, pince. Poignées ergonomiques antidérapantes. Acier inoxydable durable.",
        price: 25000,
        currency: "XOF",
        stock: 18,
        condition: "new",
        sku: "KIT-CUI-12",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 5,
        rating: 4.3,
        review_count: 2,
        image: "https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("mode-africaine-elite"),
        category_id: catMap.get("beaute-sante"),
        title: "Crème Éclaircissante Naturelle 200ml",
        slug: "creme-eclaircissante-naturelle-200ml",
        description: "Crème éclaircissante 100% naturelle à base de beurre de karité et huile de baobab. Hydratation profonde, teint unifié. Sans hydroquinone. Fabriquée au Burkina Faso.",
        price: 8500,
        currency: "XOF",
        stock: 30,
        condition: "new",
        sku: "CRE-ECL-200",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 4,
        rating: 4.1,
        review_count: 3,
        image: "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("tech-burkina"),
        category_id: catMap.get("sports-loisirs"),
        title: "Vélo VTT 26\" 21 Vitesses",
        slug: "velo-vtt-26-21-vitesses",
        description: "Vélo tout terrain 26 pouces, 21 vitesses Shimano. Cadre aluminium léger, freins à disque. Pneus tout-terrain. Parfait pour fitness et randonnées. Assemblage gratuit.",
        price: 145000,
        currency: "XOF",
        stock: 6,
        condition: "new",
        sku: "VEL-VTT-26",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 3,
        rating: 4.5,
        review_count: 2,
        image: "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("mode-africaine-elite"),
        category_id: catMap.get("enfants-bebes"),
        title: "Poupée Africaine Traditionnelle",
        slug: "poupee-africaine-traditionnelle",
        description: "Poupée artisanale africaine en tissu wax. Vêtements traditionnels, cheveux en fil de coton. Jouet éducatif et culturel pour enfants. Fait main au Burkina.",
        price: 7500,
        currency: "XOF",
        stock: 22,
        condition: "new",
        sku: "POU-AFR-001",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 4,
        rating: 4.8,
        review_count: 2,
        image: "https://images.pexels.com/photos/3663038/pexels-photo-3663038.jpeg?auto=compress&w=600",
      },
      // Services
      {
        seller_id: sellerMap.get("services-pro-ouaga"),
        category_id: catMap.get("services-btp"),
        title: "Service Plomberie - Dépannage 24/7",
        slug: "service-plomberie-depannage-24-7",
        description: "Service de plomberie professionnel disponible 24h/24 et 7j/7. Réparation fuites, débouchage canalisations, installation sanitaires, chauffe-eau. Intervention rapide à Ouagadougou et environs. Devis gratuit.",
        price: 25000,
        currency: "XOF",
        stock: 100,
        condition: "new",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 45,
        rating: 4.7,
        review_count: 12,
        image: "https://images.pexels.com/photos/3637728/pexels-photo-3637728.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("services-pro-ouaga"),
        category_id: catMap.get("services-btp"),
        title: "Création Site Web Professionnel",
        slug: "creation-site-web-professionnel",
        description: "Création de sites web professionnels pour entreprises et commerçants. Site vitrine, e-commerce, application web. Design responsive, référencement Google inclus. Hébergement et maintenance 1 an offerts.",
        price: 185000,
        currency: "XOF",
        stock: 50,
        condition: "new",
        city: "Ouagadougou",
        is_active: true,
        is_featured: true,
        total_sales: 22,
        rating: 4.9,
        review_count: 8,
        image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&w=600",
      },
      {
        seller_id: sellerMap.get("services-pro-ouaga"),
        category_id: catMap.get("services-btp"),
        title: "Couture Sur Mesure - Toutes Tenues",
        slug: "couture-sur-mesure-toutes-tenues",
        description: "Service de couture sur mesure pour hommes et femmes. Robes, costumes, tenues traditionnelles, uniformes. Délais rapides, finitions impeccables. Premier ajustement gratuit. Possibilité de déplacement à domicile.",
        price: 35000,
        currency: "XOF",
        stock: 80,
        condition: "new",
        city: "Ouagadougou",
        is_active: true,
        total_sales: 38,
        rating: 4.6,
        review_count: 10,
        image: "https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&w=600",
      },
    ];

    for (const prod of products) {
      if (!prod.seller_id) continue;
      const { data: existing } = await supabase.from("products").select("id").eq("slug", prod.slug).maybeSingle();
      if (!existing) {
        const { data: newProduct } = await supabase
          .from("products")
          .insert({
            seller_id: prod.seller_id,
            category_id: prod.category_id,
            title: prod.title,
            slug: prod.slug,
            description: prod.description,
            price: prod.price,
            compare_price: prod.compare_price || null,
            currency: prod.currency,
            stock: prod.stock,
            condition: prod.condition,
            sku: prod.sku || null,
            city: prod.city,
            is_active: prod.is_active,
            is_featured: prod.is_featured,
            total_sales: prod.total_sales,
            rating: prod.rating,
            review_count: prod.review_count,
          })
          .select("id")
          .single();

        if (newProduct && prod.image) {
          await supabase.from("product_images").insert({
            product_id: newProduct.id,
            url: prod.image,
            alt_text: prod.title,
            is_primary: true,
            sort_order: 0,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Demo data seeded successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
