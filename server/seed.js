import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Course from './models/Course.js';
import Batch from './models/Batch.js';
import Lecture from './models/Lecture.js';

await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected successfully");

const adminEmail = process.env.ADMIN_EMAIL || 'admin@institute.com';
if (!(await User.findOne({ email: adminEmail }))) {
  await User.create({ name: 'Institute Admin', email: adminEmail, password: process.env.ADMIN_PASSWORD || 'Admin@12345', role: 'admin' });
  console.log(`Admin created: ${adminEmail}`);
}

let teacher = await User.findOne({ email: 'teacher@institute.com' });
if (!teacher) teacher = await User.create({ name: 'Priya Sharma', email: 'teacher@institute.com', password: 'Teacher@123', role: 'teacher' });

if ((await Course.countDocuments()) === 0) {
  const sample = [
    { title: 'Spoken English Foundation', level: 'Beginner', price: 4999, durationWeeks: 8, mode: 'both',
      description: 'Build the confidence to start speaking. Daily sentences, pronunciation basics and simple conversations about everyday life.',
      syllabus: ['Introductions and small talk', 'Present, past and future in speech', 'Pronunciation and stress', 'Shopping, travel and phone calls', 'Speaking practice and feedback'] },
    { title: 'Fluency and Confidence', level: 'Intermediate', price: 6999, durationWeeks: 10, mode: 'both',
      description: 'Speak without translating in your head. Group discussions, storytelling and handling unexpected questions.',
      syllabus: ['Linking ideas smoothly', 'Phrasal verbs and idioms', 'Group discussion practice', 'Storytelling', 'Accent and intonation'] },
    { title: 'Interview and Professional English', level: 'Advanced', price: 8999, durationWeeks: 8, mode: 'live',
      description: 'Prepare for interviews, meetings and presentations with mock sessions and one-to-one feedback.',
      syllabus: ['Self-introduction that stands out', 'Mock interviews', 'Meeting and email English', 'Presentation skills', 'Negotiation phrases'] },
    { title: 'Self-paced Grammar for Speaking', level: 'Beginner', price: 1999, durationWeeks: 6, mode: 'recorded',
      description: 'Short recorded lessons on the grammar you actually need when you talk.',
      syllabus: ['Tenses in conversation', 'Articles and prepositions', 'Question forms', 'Common mistakes'] },
  ];
  const courses = await Course.insertMany(sample);

  const next = (days) => new Date(Date.now() + days * 24 * 3600 * 1000);
  await Batch.insertMany([
    { name: 'Weekday Evening', course: courses[0]._id, teacher: teacher._id, startDate: next(7), days: ['Mon', 'Wed', 'Fri'], timing: '7:00 PM - 8:00 PM IST', seatLimit: 20 },
    { name: 'Weekend Morning', course: courses[0]._id, teacher: teacher._id, startDate: next(10), days: ['Sat', 'Sun'], timing: '10:00 AM - 11:30 AM IST', seatLimit: 15 },
    { name: 'Evening Fluency', course: courses[1]._id, teacher: teacher._id, startDate: next(14), days: ['Tue', 'Thu'], timing: '8:00 PM - 9:00 PM IST', seatLimit: 15 },
    { name: 'Interview Batch', course: courses[2]._id, teacher: teacher._id, startDate: next(12), days: ['Mon', 'Wed'], timing: '6:30 PM - 7:30 PM IST', seatLimit: 10 },
  ]);

  // Replace these sample URLs with your own unlisted YouTube/Vimeo links
  const url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
  await Lecture.insertMany([
    { course: courses[3]._id, title: 'Welcome and how to use this course', videoUrl: url, order: 1, durationMins: 5, isFree: true },
    { course: courses[3]._id, title: 'Present tenses in daily talk', videoUrl: url, order: 2, durationMins: 18 },
    { course: courses[3]._id, title: 'Past tenses and storytelling', videoUrl: url, order: 3, durationMins: 22 },
    { course: courses[0]._id, title: 'Pronunciation warm-up (recorded)', videoUrl: url, order: 1, durationMins: 12, isFree: true },
    { course: courses[0]._id, title: 'Introducing yourself', videoUrl: url, order: 2, durationMins: 15 },
  ]);
  console.log('Sample courses, batches and lectures created');
}

await mongoose.disconnect();
console.log('Seed finished');
