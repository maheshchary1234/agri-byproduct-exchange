package com.agriexchange.service;

import com.agriexchange.model.*;
import com.agriexchange.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializerService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerService.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializerService(UserRepository userRepository, CategoryRepository categoryRepository,
                                  ProductRepository productRepository, OrderRepository orderRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with {} users. Skipping automatic seed.", userRepository.count());
            return;
        }

        log.info("Initializing Seed Data for Agricultural By-Product Exchange Platform...");

        // 1. Categories
        Category catCereal = categoryRepository.save(new Category("Cereal Straws & Stubble", "CEREAL_STRAW", "Paddy and wheat straw for CBG and 2G bio-refineries", 1.45));
        Category catSugar = categoryRepository.save(new Category("Sugar Mill By-Products", "SUGAR_BYPRODUCT", "Bagasse, press mud for paper and co-generation boilers", 1.30));
        Category catFiber = categoryRepository.save(new Category("Fibers & Husk Residues", "FIBER_HUSK", "Coir pith, rice husks for horticulture and refractory bricks", 1.15));
        Category catStalk = categoryRepository.save(new Category("Stalks & Woody Biomass", "WOODY_STALK", "Cotton stalks, corn cobs for pellets and briquettes", 1.38));

        // 2. Users
        String encPass = passwordEncoder.encode("Password123!");

        User admin = userRepository.save(new User(
            "Platform Admin", "admin@agriexchange.org", encPass, Role.ROLE_ADMIN,
            "+91 98765 00001", null, "AgriExchange Central Oversight", "100 Green Tech Park",
            "Gurugram", "Haryana", "122002", true
        ));

        User farmerGurpreet = userRepository.save(new User(
            "Gurpreet Singh", "farmer.gurpreet@agriexchange.org", encPass, Role.ROLE_FARMER,
            "+91 98141 23456", 28.5, "Kisan Samriddhi Farms", "Village Samrala, GT Road",
            "Ludhiana", "Punjab", "141114", true
        ));

        User farmerPatil = userRepository.save(new User(
            "Ramesh Patil", "farmer.patil@agriexchange.org", encPass, Role.ROLE_FARMER,
            "+91 98220 34567", 45.0, "Sahyadri Agro Residuaries", "Karveer Taluk",
            "Kolhapur", "Maharashtra", "416004", true
        ));

        User farmerMurugan = userRepository.save(new User(
            "Murugan Selvam", "farmer.murugan@agriexchange.org", encPass, Role.ROLE_FARMER,
            "+91 94433 45678", 18.0, "Annamalai Coir & Agro", "Pollachi High Road",
            "Coimbatore", "Tamil Nadu", "642001", true
        ));

        User buyerBioenergy = userRepository.save(new User(
            "Dr. Arvinder Mehta", "buyer.bioenergy@biopower.com", encPass, Role.ROLE_BUYER,
            "+91 98110 67890", "GreenTerra BioEnergy 50MW Plant", "Plot 45, Ecotech Industrial Area",
            "Greater Noida", "Uttar Pradesh", "201306", true
        ));

        User buyerEcoPulp = userRepository.save(new User(
            "Sunita Deshmukh", "buyer.ecopulp@ecopaper.com", encPass, Role.ROLE_BUYER,
            "+91 98230 78901", "EcoPulp & Packaging Mills", "MIDC Chakan Industrial Corridor",
            "Pune", "Maharashtra", "410501", true
        ));

        // 3. Products
        Product p1 = new Product();
        p1.setFarmer(farmerGurpreet);
        p1.setCategory(catCereal);
        p1.setTitle("Premium High-Density Paddy Rice Straw Bales");
        p1.setByproductType("rice_straw");
        p1.setDescription("Square baled rice straw collected with modern balers, moisture tightly controlled under 13%. Suitable for CBG digesters and 2G ethanol refineries.");
        p1.setQuantityTons(120.0);
        p1.setAvailableQuantityTons(75.0);
        p1.setMoistureContentPercent(12.5);
        p1.setOrganicMatterPercent(84.5);
        p1.setPricePerTon(2450.0);
        p1.setEstimatedMarketPrice(2400.0);
        p1.setPackagingType("Square Bales (25kg)");
        p1.setStorageType("Covered Tarpaulin Shed");
        p1.setHarvestSeason("Kharif");
        p1.setState("Punjab");
        p1.setDistrict("Ludhiana");
        p1.setPincode("141114");
        p1.setImageUrl("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80");
        p1.setStatus("AVAILABLE");
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setFarmer(farmerPatil);
        p2.setCategory(catSugar);
        p2.setTitle("Sun-Dried Sugarcane Bagasse (Caloric 2200 kcal/kg)");
        p2.setByproductType("sugarcane_bagasse");
        p2.setDescription("Screened, de-pocked sugarcane mill residue. Very low ash content, superior burning characteristics for industrial fluidized boilers.");
        p2.setQuantityTons(350.0);
        p2.setAvailableQuantityTons(350.0);
        p2.setMoistureContentPercent(18.0);
        p2.setOrganicMatterPercent(89.0);
        p2.setPricePerTon(2800.0);
        p2.setEstimatedMarketPrice(2750.0);
        p2.setPackagingType("Loose Bulk Loaded in Tiplers");
        p2.setStorageType("Asphalt Concrete Yard");
        p2.setHarvestSeason("Rabi");
        p2.setState("Maharashtra");
        p2.setDistrict("Kolhapur");
        p2.setPincode("416004");
        p2.setImageUrl("https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80");
        p2.setStatus("AVAILABLE");
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setFarmer(farmerMurugan);
        p3.setCategory(catFiber);
        p3.setTitle("Washed Low-EC Coconut Coir Pith Briquettes");
        p3.setByproductType("coir_pith");
        p3.setDescription("Electrical conductivity below 0.5 mS/cm. Naturally aged 6+ months, washed with clean borewell water. Ideal for greenhouse hydroponics & potting mixes.");
        p3.setQuantityTons(85.0);
        p3.setAvailableQuantityTons(45.0);
        p3.setMoistureContentPercent(14.0);
        p3.setOrganicMatterPercent(94.0);
        p3.setPricePerTon(5200.0);
        p3.setEstimatedMarketPrice(5350.0);
        p3.setPackagingType("Palletized 5kg Compressed Blocks");
        p3.setStorageType("Indoor Warehouse");
        p3.setHarvestSeason("Zaid");
        p3.setState("Tamil Nadu");
        p3.setDistrict("Coimbatore");
        p3.setPincode("642001");
        p3.setImageUrl("https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80");
        p3.setStatus("AVAILABLE");
        productRepository.save(p3);

        Product p4 = new Product();
        p4.setFarmer(farmerPatil);
        p4.setCategory(catStalk);
        p4.setTitle("Dried De-shelled Corn Cobs for Furfural & Boilers");
        p4.setByproductType("corn_cob");
        p4.setDescription("Whole de-kernelled corn cobs, sun dried to moisture < 10%. High pentosan content for furfural extraction or clean fuel pellets.");
        p4.setQuantityTons(140.0);
        p4.setAvailableQuantityTons(110.0);
        p4.setMoistureContentPercent(9.5);
        p4.setOrganicMatterPercent(91.2);
        p4.setPricePerTon(3600.0);
        p4.setEstimatedMarketPrice(3550.0);
        p4.setPackagingType("PP Woven Sacks (40kg)");
        p4.setStorageType("Covered Metal Hangar");
        p4.setHarvestSeason("Kharif");
        p4.setState("Maharashtra");
        p4.setDistrict("Kolhapur");
        p4.setPincode("416004");
        p4.setImageUrl("https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80");
        p4.setStatus("AVAILABLE");
        productRepository.save(p4);

        // 4. Sample Order
        Order o1 = new Order();
        o1.setOrderNumber("ORD-202610-8841");
        o1.setBuyer(buyerBioenergy);
        o1.setFarmer(farmerGurpreet);
        o1.setProduct(p1);
        o1.setQuantityTons(45.0);
        o1.setPricePerTon(2450.0);
        o1.setSubtotalAmount(110250.0);
        o1.setLogisticsFee(9500.0);
        o1.setTaxAmount(5987.5);
        o1.setTotalAmount(125737.5);
        o1.setDeliveryAddress("GreenTerra Thermal Co-Gen Plant, Gate 3, Sector 60");
        o1.setDeliveryDistrict("Greater Noida");
        o1.setDeliveryState("Uttar Pradesh");
        o1.setDeliveryPincode("201306");
        o1.setTransportType("Platform 3PL Logistics Fleet");
        o1.setOrderStatus("DELIVERED");
        o1.setPaymentStatus("RELEASED_TO_FARMER");
        orderRepository.save(o1);

        log.info("Seed data successfully created! Ready for demo authentication and transactions.");
    }
}
