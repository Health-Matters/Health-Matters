import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';
import Service from '../src/models/Service';
import Referral from '../src/models/Referral';
import Appointment from '../src/models/Appointment';
import MedicalRecord from '../src/models/MedicalRecord';
import Notification from '../src/models/Notification';
import connectDB from '../src/config/db';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});
    await Referral.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Notification.deleteMany({});
    
    console.log('✅ Existing data cleared');
    
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    // ========== USERS ==========
    console.log('👥 Seeding users...');
    
    // 1 Admin
    const admin = await User.create({
      email: 'admin@healthmatters.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+44-7700-900001',
      dateOfBirth: new Date('1985-03-15'),
      address: {
        line1: '123 Admin Street',
        city: 'London',
        postcode: 'SW1A 1AA'
      },
      employeeId: 'EMP-001',
      department: 'Administration',
      isActive: true
    });
    
    // 3 Practitioners
    const practitioner1 = await User.create({
      email: 'dr.smith@healthmatters.com',
      password: hashedPassword,
      role: 'practitioner',
      firstName: 'James',
      lastName: 'Smith',
      phone: '+44-7700-900002',
      dateOfBirth: new Date('1980-07-22'),
      address: {
        line1: '45 Medical Lane',
        city: 'Manchester',
        postcode: 'M1 1AA'
      },
      employeeId: 'EMP-002',
      department: 'Occupational Health',
      specialization: 'Occupational Medicine',
      qualifications: ['MBBS', 'MFOM', 'Dip Occ Med'],
      isActive: true
    });
    
    const practitioner2 = await User.create({
      email: 'dr.williams@healthmatters.com',
      password: hashedPassword,
      role: 'practitioner',
      firstName: 'Emma',
      lastName: 'Williams',
      phone: '+44-7700-900003',
      dateOfBirth: new Date('1982-11-10'),
      address: {
        line1: '67 Health Avenue',
        city: 'Birmingham',
        postcode: 'B1 1AA'
      },
      employeeId: 'EMP-003',
      department: 'Mental Health',
      specialization: 'Clinical Psychology',
      qualifications: ['PhD Psychology', 'HCPC Registered'],
      isActive: true
    });
    
    const practitioner3 = await User.create({
      email: 'dr.brown@healthmatters.com',
      password: hashedPassword,
      role: 'practitioner',
      firstName: 'Michael',
      lastName: 'Brown',
      phone: '+44-7700-900004',
      dateOfBirth: new Date('1978-05-18'),
      address: {
        line1: '89 Wellness Road',
        city: 'Leeds',
        postcode: 'LS1 1AA'
      },
      employeeId: 'EMP-004',
      department: 'Physiotherapy',
      specialization: 'Musculoskeletal Physiotherapy',
      qualifications: ['BSc Physiotherapy', 'MSc Sports Medicine'],
      isActive: true
    });
    
    // 3 Managers
    const manager1 = await User.create({
      email: 'john.manager@healthmatters.com',
      password: hashedPassword,
      role: 'manager',
      firstName: 'John',
      lastName: 'Taylor',
      phone: '+44-7700-900005',
      dateOfBirth: new Date('1975-09-25'),
      address: {
        line1: '12 Manager Close',
        city: 'London',
        postcode: 'E1 6AN'
      },
      employeeId: 'EMP-005',
      department: 'IT Department',
      isActive: true
    });
    
    const manager2 = await User.create({
      email: 'lisa.manager@healthmatters.com',
      password: hashedPassword,
      role: 'manager',
      firstName: 'Lisa',
      lastName: 'Anderson',
      phone: '+44-7700-900006',
      dateOfBirth: new Date('1983-02-14'),
      address: {
        line1: '34 Leadership Street',
        city: 'Bristol',
        postcode: 'BS1 1AA'
      },
      employeeId: 'EMP-006',
      department: 'HR Department',
      isActive: true
    });
    
    const manager3 = await User.create({
      email: 'david.manager@healthmatters.com',
      password: hashedPassword,
      role: 'manager',
      firstName: 'David',
      lastName: 'Wilson',
      phone: '+44-7700-900007',
      dateOfBirth: new Date('1979-12-05'),
      address: {
        line1: '56 Team Plaza',
        city: 'Liverpool',
        postcode: 'L1 1AA'
      },
      employeeId: 'EMP-007',
      department: 'Finance Department',
      isActive: true
    });
    
    // 8 Employees
    const employee1 = await User.create({
      email: 'alice.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Alice',
      lastName: 'Roberts',
      phone: '+44-7700-900008',
      dateOfBirth: new Date('1990-04-12'),
      address: {
        line1: '78 Worker Street',
        city: 'London',
        postcode: 'SE1 1AA'
      },
      employeeId: 'EMP-008',
      department: 'IT Department',
      managerId: manager1._id,
      isActive: true
    });
    
    const employee2 = await User.create({
      email: 'bob.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Bob',
      lastName: 'Martin',
      phone: '+44-7700-900009',
      dateOfBirth: new Date('1988-08-20'),
      address: {
        line1: '90 Staff Avenue',
        city: 'London',
        postcode: 'N1 1AA'
      },
      employeeId: 'EMP-009',
      department: 'IT Department',
      managerId: manager1._id,
      isActive: true
    });
    
    const employee3 = await User.create({
      email: 'carol.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Carol',
      lastName: 'Davis',
      phone: '+44-7700-900010',
      dateOfBirth: new Date('1992-01-30'),
      address: {
        line1: '11 Employee Road',
        city: 'Bristol',
        postcode: 'BS2 1AA'
      },
      employeeId: 'EMP-010',
      department: 'HR Department',
      managerId: manager2._id,
      isActive: true
    });
    
    const employee4 = await User.create({
      email: 'daniel.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Daniel',
      lastName: 'Moore',
      phone: '+44-7700-900011',
      dateOfBirth: new Date('1987-06-18'),
      address: {
        line1: '22 Team Member Lane',
        city: 'Bristol',
        postcode: 'BS3 1AA'
      },
      employeeId: 'EMP-011',
      department: 'HR Department',
      managerId: manager2._id,
      isActive: true
    });
    
    const employee5 = await User.create({
      email: 'emily.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Emily',
      lastName: 'White',
      phone: '+44-7700-900012',
      dateOfBirth: new Date('1991-10-08'),
      address: {
        line1: '33 Staff Close',
        city: 'Liverpool',
        postcode: 'L2 1AA'
      },
      employeeId: 'EMP-012',
      department: 'Finance Department',
      managerId: manager3._id,
      isActive: true
    });
    
    const employee6 = await User.create({
      email: 'frank.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Frank',
      lastName: 'Harris',
      phone: '+44-7700-900013',
      dateOfBirth: new Date('1989-03-22'),
      address: {
        line1: '44 Worker Plaza',
        city: 'Liverpool',
        postcode: 'L3 1AA'
      },
      employeeId: 'EMP-013',
      department: 'Finance Department',
      managerId: manager3._id,
      isActive: true
    });
    
    const employee7 = await User.create({
      email: 'grace.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Grace',
      lastName: 'Clark',
      phone: '+44-7700-900014',
      dateOfBirth: new Date('1993-07-14'),
      address: {
        line1: '55 Employee Street',
        city: 'Manchester',
        postcode: 'M2 1AA'
      },
      employeeId: 'EMP-014',
      department: 'IT Department',
      managerId: manager1._id,
      isActive: true
    });
    
    const employee8 = await User.create({
      email: 'henry.employee@healthmatters.com',
      password: hashedPassword,
      role: 'employee',
      firstName: 'Henry',
      lastName: 'Lewis',
      phone: '+44-7700-900015',
      dateOfBirth: new Date('1986-11-28'),
      address: {
        line1: '66 Team Avenue',
        city: 'Birmingham',
        postcode: 'B2 1AA'
      },
      employeeId: 'EMP-015',
      department: 'HR Department',
      managerId: manager2._id,
      isActive: true
    });
    
    console.log('✅ Users seeded');
    
    // ========== SERVICES ==========
    console.log('🏥 Seeding services...');
    
    const service1 = await Service.create({
      name: 'Occupational Health Assessment',
      code: 'OHA-001',
      description: 'Comprehensive health assessment for workplace fitness',
      category: 'occupational_health',
      defaultDuration: 45,
      pricing: {
        internalCost: 75,
        clientCharge: 150,
        currency: 'GBP'
      },
      requiresInitialQuestionnaire: true,
      initialQuestionnaireTemplate: {
        title: 'Pre-Assessment Health Questionnaire',
        questions: [
          {
            id: 'q1',
            question: 'Do you have any current medical conditions?',
            type: 'yes_no',
            required: true
          },
          {
            id: 'q2',
            question: 'Are you currently taking any medication?',
            type: 'text',
            required: false
          },
          {
            id: 'q3',
            question: 'Have you had any recent absences due to illness?',
            type: 'yes_no',
            required: true
          }
        ]
      },
      requiresFollowUpQuestionnaire: true,
      followUpQuestionnaireTemplate: {
        title: 'Post-Assessment Follow-up',
        questions: [
          {
            id: 'f1',
            question: 'How do you feel since the assessment?',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
            required: true
          }
        ]
      },
      availableForSelfReferral: true,
      requiresManagerApproval: false,
      qualifiedPractitionerIds: [practitioner1._id],
      isActive: true
    });
    
    const service2 = await Service.create({
      name: 'Mental Health Counselling',
      code: 'MHC-001',
      description: 'Professional counselling for work-related stress and mental health',
      category: 'mental_health',
      defaultDuration: 60,
      pricing: {
        internalCost: 90,
        clientCharge: 180,
        currency: 'GBP'
      },
      requiresInitialQuestionnaire: true,
      initialQuestionnaireTemplate: {
        title: 'Mental Health Initial Assessment',
        questions: [
          {
            id: 'mh1',
            question: 'How would you rate your current stress level?',
            type: 'scale',
            options: ['1', '2', '3', '4', '5'],
            required: true
          },
          {
            id: 'mh2',
            question: 'Are you experiencing any sleep difficulties?',
            type: 'yes_no',
            required: true
          }
        ]
      },
      availableForSelfReferral: true,
      requiresManagerApproval: false,
      qualifiedPractitionerIds: [practitioner2._id],
      isActive: true
    });
    
    const service3 = await Service.create({
      name: 'Physiotherapy Session',
      code: 'PHYSIO-001',
      description: 'Treatment for musculoskeletal conditions and workplace injuries',
      category: 'physiotherapy',
      defaultDuration: 30,
      pricing: {
        internalCost: 50,
        clientCharge: 100,
        currency: 'GBP'
      },
      requiresInitialQuestionnaire: true,
      initialQuestionnaireTemplate: {
        title: 'Physiotherapy Assessment Form',
        questions: [
          {
            id: 'p1',
            question: 'Where is your pain/discomfort located?',
            type: 'text',
            required: true
          },
          {
            id: 'p2',
            question: 'On a scale of 1-10, how severe is the pain?',
            type: 'scale',
            options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            required: true
          }
        ]
      },
      availableForSelfReferral: true,
      requiresManagerApproval: false,
      qualifiedPractitionerIds: [practitioner3._id],
      isActive: true
    });
    
    const service4 = await Service.create({
      name: 'Health Screening',
      code: 'HS-001',
      description: 'Annual health screening including blood pressure, BMI, and general health check',
      category: 'health_screening',
      defaultDuration: 30,
      pricing: {
        internalCost: 60,
        clientCharge: 120,
        currency: 'GBP'
      },
      requiresInitialQuestionnaire: false,
      availableForSelfReferral: true,
      requiresManagerApproval: false,
      qualifiedPractitionerIds: [practitioner1._id, practitioner2._id],
      isActive: true
    });
    
    const service5 = await Service.create({
      name: 'Ergonomic Assessment',
      code: 'ERGO-001',
      description: 'Workplace ergonomic assessment and recommendations',
      category: 'ergonomic_assessment',
      defaultDuration: 45,
      pricing: {
        internalCost: 70,
        clientCharge: 140,
        currency: 'GBP'
      },
      requiresInitialQuestionnaire: true,
      initialQuestionnaireTemplate: {
        title: 'Ergonomic Assessment Request',
        questions: [
          {
            id: 'e1',
            question: 'What type of workstation do you use?',
            type: 'multiple_choice',
            options: ['Desk-based', 'Standing desk', 'Hot-desking', 'Remote/Home office'],
            required: true
          },
          {
            id: 'e2',
            question: 'Do you experience any discomfort while working?',
            type: 'yes_no',
            required: true
          }
        ]
      },
      availableForSelfReferral: false,
      requiresManagerApproval: true,
      qualifiedPractitionerIds: [practitioner1._id, practitioner3._id],
      isActive: true
    });
    
    console.log('✅ Services seeded');
    
    // ========== REFERRALS ==========
    console.log('📋 Seeding referrals...');
    
    const referral1 = await Referral.create({
      referralNumber: 'REF-2026-00001',
      employeeId: employee1._id,
      referredById: employee1._id,
      assignedPractitionerId: practitioner1._id,
      type: 'self_referral',
      serviceId: service1._id,
      reasonForReferral: 'Feeling stressed and need health assessment',
      urgencyLevel: 'routine',
      status: 'completed',
      initialQuestionnaire: {
        completedAt: new Date('2026-01-02'),
        responses: {
          q1: 'no',
          q2: '',
          q3: 'no'
        }
      },
      outcome: {
        summary: 'Employee is fit for work. No health concerns identified.',
        recommendations: 'Continue regular exercise and maintain healthy lifestyle.',
        reportGeneratedAt: new Date('2026-01-05'),
        reportGeneratedBy: practitioner1._id,
        adviceNotes: 'Follow up in 6 months for routine check.'
      },
      sla: {
        submittedAt: new Date('2026-01-02'),
        triagedAt: new Date('2026-01-02'),
        appointedAt: new Date('2026-01-03'),
        completedAt: new Date('2026-01-05'),
        daysToTriage: 0,
        daysToAppointment: 1,
        daysToCompletion: 3,
        breached: false
      },
      history: [
        {
          action: 'Referral submitted',
          performedBy: employee1._id,
          performedByName: 'Alice Roberts',
          timestamp: new Date('2026-01-02'),
          newStatus: 'submitted'
        },
        {
          action: 'Referral triaged',
          performedBy: admin._id,
          performedByName: 'Sarah Johnson',
          timestamp: new Date('2026-01-02'),
          previousStatus: 'submitted',
          newStatus: 'triaged'
        },
        {
          action: 'Appointment scheduled',
          performedBy: practitioner1._id,
          performedByName: 'James Smith',
          timestamp: new Date('2026-01-03'),
          previousStatus: 'triaged',
          newStatus: 'appointed'
        }
      ]
    });
    
    const referral2 = await Referral.create({
      referralNumber: 'REF-2026-00002',
      employeeId: employee2._id,
      referredById: manager1._id,
      assignedPractitionerId: practitioner2._id,
      type: 'manager_referral',
      serviceId: service2._id,
      reasonForReferral: 'Employee showing signs of workplace stress',
      urgencyLevel: 'urgent',
      status: 'appointed',
      initialQuestionnaire: {
        completedAt: new Date('2026-01-04'),
        responses: {
          mh1: '4',
          mh2: 'yes'
        }
      },
      sla: {
        submittedAt: new Date('2026-01-03'),
        triagedAt: new Date('2026-01-03'),
        appointedAt: new Date('2026-01-04'),
        daysToTriage: 0,
        daysToAppointment: 1,
        breached: false
      },
      history: [
        {
          action: 'Referral submitted',
          performedBy: manager1._id,
          performedByName: 'John Taylor',
          timestamp: new Date('2026-01-03'),
          newStatus: 'submitted'
        },
        {
          action: 'Referral triaged',
          performedBy: admin._id,
          performedByName: 'Sarah Johnson',
          timestamp: new Date('2026-01-03'),
          previousStatus: 'submitted',
          newStatus: 'triaged'
        }
      ]
    });
    
    const referral3 = await Referral.create({
      referralNumber: 'REF-2026-00003',
      employeeId: employee3._id,
      referredById: employee3._id,
      type: 'self_referral',
      serviceId: service3._id,
      reasonForReferral: 'Lower back pain from desk work',
      urgencyLevel: 'routine',
      status: 'triaged',
      sla: {
        submittedAt: new Date('2026-01-05'),
        triagedAt: new Date('2026-01-06'),
        daysToTriage: 1,
        breached: false
      },
      history: [
        {
          action: 'Referral submitted',
          performedBy: employee3._id,
          performedByName: 'Carol Davis',
          timestamp: new Date('2026-01-05'),
          newStatus: 'submitted'
        }
      ]
    });
    
    console.log('✅ Referrals seeded');
    
    // ========== APPOINTMENTS ==========
    console.log('📅 Seeding appointments...');
    
    await Appointment.create({
      referralId: referral1._id,
      practitionerId: practitioner1._id,
      employeeId: employee1._id,
      scheduledDate: new Date('2026-01-04T10:00:00'),
      scheduledTime: '10:00',
      duration: 45,
      endTime: new Date('2026-01-04T10:45:00'),
      location: 'Health Center - Room 101',
      appointmentType: 'in_person',
      roomNumber: '101',
      status: 'completed',
      clinicalNotes: 'Patient presented in good health. No concerns raised during assessment.',
      reminders: [
        {
          type: 'email',
          sentAt: new Date('2026-01-03T10:00:00'),
          sentTo: employee1._id
        }
      ]
    });
    
    await Appointment.create({
      referralId: referral2._id,
      practitionerId: practitioner2._id,
      employeeId: employee2._id,
      scheduledDate: new Date('2026-01-08T14:00:00'),
      scheduledTime: '14:00',
      duration: 60,
      endTime: new Date('2026-01-08T15:00:00'),
      appointmentType: 'video_call',
      meetingLink: 'https://meet.healthmatters.com/session-12345',
      status: 'confirmed',
      reminders: []
    });
    
    console.log('✅ Appointments seeded');
    
    // ========== MEDICAL RECORDS ==========
    console.log('📄 Seeding medical records...');
    
    await MedicalRecord.create({
      employeeId: employee1._id,
      referralId: referral1._id,
      practitionerId: practitioner1._id,
      recordType: 'consultation_notes',
      title: 'Occupational Health Assessment - January 2026',
      content: 'Patient attended for routine occupational health assessment. No significant medical history. Blood pressure: 120/80. BMI: 23.5 (normal range). General health: Good. Patient reports managing stress well through regular exercise. Fit for all duties.',
      accessLog: [
        {
          accessedBy: practitioner1._id,
          accessedByName: 'James Smith',
          accessedByRole: 'practitioner',
          accessedAt: new Date('2026-01-04T10:45:00'),
          accessPurpose: 'Record creation'
        }
      ],
      isArchived: false
    });
    
    console.log('✅ Medical records seeded');
    
    // ========== NOTIFICATIONS ==========
    console.log('🔔 Seeding notifications...');
    
    await Notification.create({
      recipientId: employee1._id,
      type: 'outcome_report_ready',
      title: 'Your Health Assessment Report is Ready',
      message: 'Your occupational health assessment report has been completed and is now available to view.',
      relatedEntityType: 'referral',
      relatedEntityId: referral1._id,
      channels: {
        email: {
          sent: true,
          sentAt: new Date('2026-01-05T09:00:00')
        },
        sms: {
          sent: false
        },
        inApp: {
          read: false
        }
      },
      priority: 'medium'
    });
    
    await Notification.create({
      recipientId: employee2._id,
      type: 'appointment_scheduled',
      title: 'Appointment Scheduled',
      message: 'Your mental health counselling appointment has been scheduled for January 8, 2026 at 14:00.',
      relatedEntityType: 'appointment',
      relatedEntityId: referral2._id,
      channels: {
        email: {
          sent: true,
          sentAt: new Date('2026-01-04T15:00:00')
        },
        sms: {
          sent: true,
          sentAt: new Date('2026-01-04T15:01:00')
        },
        inApp: {
          read: true,
          readAt: new Date('2026-01-04T16:30:00')
        }
      },
      priority: 'high'
    });
    
    await Notification.create({
      recipientId: admin._id,
      type: 'referral_submitted',
      title: 'New Referral Requires Triage',
      message: 'A new referral (REF-2026-00003) has been submitted and requires triage.',
      relatedEntityType: 'referral',
      relatedEntityId: referral3._id,
      channels: {
        email: {
          sent: true,
          sentAt: new Date('2026-01-05T11:00:00')
        },
        sms: {
          sent: false
        },
        inApp: {
          read: false
        }
      },
      priority: 'high'
    });
    
    console.log('✅ Notifications seeded');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Services: ${await Service.countDocuments()}`);
    console.log(`   - Referrals: ${await Referral.countDocuments()}`);
    console.log(`   - Appointments: ${await Appointment.countDocuments()}`);
    console.log(`   - Medical Records: ${await MedicalRecord.countDocuments()}`);
    console.log(`   - Notifications: ${await Notification.countDocuments()}`);
    console.log('\n👤 Test Credentials:');
    console.log('   Email: admin@healthmatters.com | Password: Password123!');
    console.log('   Email: dr.smith@healthmatters.com | Password: Password123!');
    console.log('   Email: john.manager@healthmatters.com | Password: Password123!');
    console.log('   Email: alice.employee@healthmatters.com | Password: Password123!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Export for use in other files
export default seedDatabase;

// Run directly if this file is executed
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
