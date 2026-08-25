package com.skillmentor.config;

import com.skillmentor.model.*;
import com.skillmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final UserSkillRepository userSkillRepository;
        private final WalletRepository walletRepository;
        private final PeerRequestRepository peerRequestRepository;
        private final MentorshipSessionRepository sessionRepository;
        private final ReviewRepository reviewRepository;
        private final MentorVerificationRepository verificationRepository;
        private final ReportRepository reportRepository;
        private final AdminActionLogRepository actionLogRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() > 0)
                        return;

                // 0. Create System Administrator User
                User admin = User.builder()
                                .name("System Administrator")
                                .email("admin@skillmentor.com")
                                .password(passwordEncoder.encode("password123"))
                                .role(User.Role.ADMIN)
                                .verificationStatus(User.VerificationStatus.VERIFIED)
                                .collegeName("JSS Academy of Technical Education")
                                .bio("Platform governance and verification moderation administrator.")
                                .hourlyRate(0.0)
                                .averageRating(5.0)
                                .totalReviews(0)
                                .build();
                admin = userRepository.save(admin);
                walletRepository.save(Wallet.builder().user(admin).creditBalance(1000).build());

                // 1. Create Student 1 User (Nitesh Kumar - MCA Student at JSSATEN)
                User student = User.builder()
                                .name("Nitesh Kumar")
                                .email("student@jssaten.ac.in")
                                .password(passwordEncoder.encode("password123"))
                                .role(User.Role.STUDENT)
                                .verificationStatus(User.VerificationStatus.VERIFIED)
                                .collegeEmail("nitesh.kumar@jssaten.ac.in")
                                .collegeName("JSS Academy of Technical Education")
                                .course("MCA")
                                .currentYear("2nd Year")
                                .passingYear(2027)
                                .bio("MCA student passionate about Java backend, Spring Boot and cloud development.")
                                .hourlyRate(0.0)
                                .averageRating(4.8)
                                .totalReviews(5)
                                .build();
                student = userRepository.save(student);
                walletRepository.save(Wallet.builder().user(student).creditBalance(50).build());

                userSkillRepository.save(
                                UserSkill.builder().user(student).skillName("Java").type(UserSkill.SkillType.OFFERED)
                                                .proficiency(UserSkill.ProficiencyLevel.INTERMEDIATE).build());
                userSkillRepository.save(UserSkill.builder().user(student).skillName("Spring Boot")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.BEGINNER)
                                .build());
                userSkillRepository.save(
                                UserSkill.builder().user(student).skillName("React").type(UserSkill.SkillType.WANTED)
                                                .proficiency(UserSkill.ProficiencyLevel.BEGINNER).build());
                userSkillRepository.save(UserSkill.builder().user(student).skillName("System Design")
                                .type(UserSkill.SkillType.WANTED).proficiency(UserSkill.ProficiencyLevel.BEGINNER)
                                .build());

                // 2. Create Mentor User 1 (Rajeev Sherma - External Verified Mentor)
                User mentor1 = User.builder()
                                .name("Rajeev Sherma")
                                .email("mentor.rajeev@tech.com")
                                .password(passwordEncoder.encode("password123"))
                                .role(User.Role.MENTOR)
                                .verificationStatus(User.VerificationStatus.VERIFIED)
                                .linkedinUrl("https://linkedin.com/in/rajeev-sherma")
                                .govtIdUrl("uploads/govt_id_rajeev.pdf")
                                .collegeName("IIT Delhi")
                                .course("B.Tech Information Technology")
                                .passingYear(2018)
                                .currentCompany("TechCorp")
                                .currentDesignation("Senior Software Engineer")
                                .availableSlots("Mon, Wed, Fri (6:00 PM - 9:00 PM)")
                                .bio("Senior Software Engineer at TechCorp. 6+ years experience in Full-Stack Web Dev & Architecture.")
                                .hourlyRate(800.0)
                                .averageRating(4.9)
                                .totalReviews(42)
                                .build();
                mentor1 = userRepository.save(mentor1);
                walletRepository.save(Wallet.builder().user(mentor1).creditBalance(120).build());

                userSkillRepository.save(
                                UserSkill.builder().user(mentor1).skillName("React").type(UserSkill.SkillType.OFFERED)
                                                .proficiency(UserSkill.ProficiencyLevel.EXPERT).build());
                userSkillRepository.save(
                                UserSkill.builder().user(mentor1).skillName("Node.js").type(UserSkill.SkillType.OFFERED)
                                                .proficiency(UserSkill.ProficiencyLevel.ADVANCED).build());
                userSkillRepository.save(UserSkill.builder().user(mentor1).skillName("System Design")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.EXPERT)
                                .build());

                // 3. Create Mentor User 2 (Sundar Pichai - Pending Verification)
                User mentorPending = User.builder()
                                .name("Sundar Pichai")
                                .email("mentor.sundar@cloud.com")
                                .password(passwordEncoder.encode("password123"))
                                .role(User.Role.MENTOR)
                                .verificationStatus(User.VerificationStatus.PENDING)
                                .linkedinUrl("https://linkedin.com/in/sundarpichai")
                                .govtIdUrl("uploads/govt_id_sundar.pdf")
                                .collegeName("BITS Pilani")
                                .course("M.Tech Computer Science")
                                .passingYear(2019)
                                .currentCompany("CloudOps Inc")
                                .currentDesignation("DevOps Lead")
                                .availableSlots("Tue, Thu (7:00 PM - 10:00 PM)")
                                .bio("Cloud Solutions Architect & AWS Certified DevOps Lead.")
                                .hourlyRate(950.0)
                                .averageRating(0.0)
                                .totalReviews(0)
                                .build();
                mentorPending = userRepository.save(mentorPending);
                walletRepository.save(Wallet.builder().user(mentorPending).creditBalance(50).build());

                verificationRepository.save(MentorVerification.builder()
                                .user(mentorPending)
                                .linkedinUrl("https://linkedin.com/in/sundarpichai")
                                .govtIdDocumentPath("uploads/govt_id_sundar.pdf")
                                .company("CloudOps Inc")
                                .designation("DevOps Lead")
                                .experienceYears(5)
                                .stage(MentorVerification.VerificationStage.PENDING)
                                .build());

                userSkillRepository.save(UserSkill.builder().user(mentorPending).skillName("AWS")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.EXPERT)
                                .build());
                userSkillRepository.save(UserSkill.builder().user(mentorPending).skillName("Docker")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.ADVANCED)
                                .build());

                // 4. Create Alumni User (Himanshu - Alumnus of JSSATEN at Google)
                User alumni = User.builder()
                                .name("Himanshu")
                                .email("alumni.himanshu@faang.com")
                                .password(passwordEncoder.encode("password123"))
                                .role(User.Role.ALUMNI)
                                .verificationStatus(User.VerificationStatus.VERIFIED)
                                .linkedinUrl("https://linkedin.com/in/himanshu-faang")
                                .govtIdUrl("uploads/govt_id_himanshu.pdf")
                                .collegeName("JSS Academy of Technical Education")
                                .course("B.Tech Computer Science")
                                .passingYear(2020)
                                .currentCompany("Google")
                                .currentDesignation("Staff Software Engineer")
                                .availableSlots("Sat, Sun (10:00 AM - 4:00 PM)")
                                .bio("Ex-Google Staff Engineer. Alumni batch of 2020. Specializing in Mock Interviews, Campus Placements & DSA.")
                                .hourlyRate(1200.0)
                                .alumniBenefitType(User.AlumniBenefitType.DISCOUNT)
                                .alumniDiscountPercent(50)
                                .averageRating(5.0)
                                .totalReviews(28)
                                .build();
                alumni = userRepository.save(alumni);
                walletRepository.save(Wallet.builder().user(alumni).creditBalance(200).build());

                userSkillRepository.save(UserSkill.builder().user(alumni).skillName("Mock Interviews")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.EXPERT)
                                .build());
                userSkillRepository.save(
                                UserSkill.builder().user(alumni).skillName("Java").type(UserSkill.SkillType.OFFERED)
                                                .proficiency(UserSkill.ProficiencyLevel.EXPERT).build());
                userSkillRepository.save(UserSkill.builder().user(alumni).skillName("System Design")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.EXPERT)
                                .build());

                // 5. Create Student 2 User (Adarsh Porwal - MCA Student at JSSATEN)
                User peerStudent = User.builder()
                                .name("Adarsh Porwal")
                                .email("peer.adarsh@jssaten.ac.in")
                                .password(passwordEncoder.encode("password123"))
                                .role(User.Role.STUDENT)
                                .verificationStatus(User.VerificationStatus.VERIFIED)
                                .collegeEmail("adarsh.porwal@jssaten.ac.in")
                                .collegeName("JSS Academy of Technical Education")
                                .course("MCA")
                                .currentYear("2nd Year")
                                .passingYear(2027)
                                .bio("MCA student & frontend enthusiast looking to master Java & SQL in exchange for React & Docker peer mentoring.")
                                .hourlyRate(0.0)
                                .averageRating(4.7)
                                .totalReviews(8)
                                .build();
                peerStudent = userRepository.save(peerStudent);
                walletRepository.save(Wallet.builder().user(peerStudent).creditBalance(80).build());

                userSkillRepository.save(UserSkill.builder().user(peerStudent).skillName("React")
                                .type(UserSkill.SkillType.OFFERED).proficiency(UserSkill.ProficiencyLevel.ADVANCED)
                                .build());
                userSkillRepository.save(
                                UserSkill.builder().user(peerStudent).skillName("Java").type(UserSkill.SkillType.WANTED)
                                                .proficiency(UserSkill.ProficiencyLevel.BEGINNER).build());

                // 6. Seed Sample Multi-Program Student Help Requests
                peerRequestRepository.save(PeerRequest.builder()
                                .requester(student)
                                .title("Need help with Spring Boot REST API")
                                .description("I have a good grasp of core Java OOPs and want to build production Spring Boot microservices.")
                                .category(PeerRequest.Category.SKILL_LEARNING)
                                .program(PeerRequest.Program.MCA)
                                .domainSubject("Backend Development")
                                .skillTag("Spring Boot")
                                .creditBudget(10)
                                .status(PeerRequest.Status.OPEN)
                                .build());

                peerRequestRepository.save(PeerRequest.builder()
                                .requester(peerStudent)
                                .title("Need guidance for MBA Finance career path")
                                .description("Looking for guidance on financial modeling and interview preparation after MBA Finance.")
                                .category(PeerRequest.Category.CAREER_GUIDANCE)
                                .program(PeerRequest.Program.MBA)
                                .domainSubject("Finance")
                                .skillTag("Finance")
                                .creditBudget(15)
                                .status(PeerRequest.Status.OPEN)
                                .build());

                peerRequestRepository.save(PeerRequest.builder()
                                .requester(student)
                                .title("Need help understanding Corporate Law concepts")
                                .description("Need guidance with corporate legal frameworks and compliance modules.")
                                .category(PeerRequest.Category.ACADEMIC_HELP)
                                .program(PeerRequest.Program.LLB)
                                .domainSubject("Corporate Law")
                                .skillTag("Corporate Law")
                                .creditBudget(10)
                                .status(PeerRequest.Status.OPEN)
                                .build());

                // 7. Seed initial completed session and review
                MentorshipSession initialSession = MentorshipSession.builder()
                                .student(student)
                                .mentor(mentor1)
                                .title("Advanced React Architecture & State Management")
                                .topicSkill("React")
                                .scheduledTime(LocalDateTime.now().minusDays(2))
                                .durationMinutes(60)
                                .sessionType(MentorshipSession.SessionType.PAID_MENTOR)
                                .priceInINR(800.0)
                                .status(MentorshipSession.SessionStatus.COMPLETED)
                                .build();
                initialSession = sessionRepository.save(initialSession);

                reviewRepository.save(Review.builder()
                                .session(initialSession)
                                .mentor(mentor1)
                                .student(student)
                                .rating(5)
                                .feedback("Outstanding session! Rajeev explained React Context and performance optimization clearly.")
                                .build());

                // 8. Seed Sample Report for Module 6 Admin Moderation
                reportRepository.save(Report.builder()
                                .reportedUser(mentorPending)
                                .reportedBy(student)
                                .reason("Incomplete profile details provided during verification submission.")
                                .status(Report.ReportStatus.PENDING)
                                .build());

                // 9. Seed Audit Log Entry
                actionLogRepository.save(AdminActionLog.builder()
                                .admin(admin)
                                .targetUser(mentor1)
                                .actionType("VERIFY_MENTOR")
                                .details("Approved LinkedIn and Govt ID credentials on system initialization.")
                                .build());

                System.out.println("==================================================");
                System.out.println("SKILLMENTOR DEV SEEDING COMPLETED (Local Development Profile)");
                System.out.println(
                                "Demo Accounts Seeded: Admin, Nitesh Kumar (Student), Adarsh Porwal (Student), Rajeev Sherma (Mentor), Sundar Pichai (Mentor), Sarah Chen (Alumni)");
                System.out.println("==================================================");
        }
}
