
const DB_KEY = 'student_db_v5';

const defaultStudent = {
    id: '20240425001',
    fullName: 'Juan Dela Cruz',
    birthdate: '2004-06-12',
    contactNumber: '+63 912 345 6789',
    email: 'juandelacruz@gmail.com',
    address: '123 Main Street, Quezon City, Metro Manila',
    program: 'BS Computer Science',
    yearLevel: '1st Year',
    admissionDate: '2024-04-25',
    status: 'Active',
    photoUrl: 'img/juan_profile.jpg',
    academicRecords: {
        '2023-2024': {
            '1st Semester': [
                { code: 'SA 101', name: 'System Administration And Maintenance', units: 3, grade: 1.50 },
                { code: 'ITSP2B', name: 'Network Implementation And Support II', units: 3, grade: 1.75 },
                { code: 'BPM101', name: 'Business Process Management In IT', units: 3, grade: 1.75 },
                { code: 'TEC101', name: 'Technopreneurship', units: 3, grade: 1.25 },
                { code: 'IAS102', name: 'Information Assurance And Security 2', units: 3, grade: 1.00 },
                { code: 'SP101', name: 'Social and Professional Issues', units: 3, grade: 1.50 }
            ],
            '2nd Semester': [
                { code: 'SA 101', name: 'System Administration And Maintenance', units: 3, grade: 3.50 },
                { code: 'ITSP2B', name: 'Network Implementation And Support II', units: 3, grade: 1.50 },
                { code: 'BPM101', name: 'Business Process Management In IT', units: 3, grade: 3.53 },
                { code: 'TEC101', name: 'Technopreneurship', units: 3, grade: 2.4 },
                { code: 'IAS102', name: 'Information Assurance And Security 2', units: 3, grade: 1.00 },
                { code: 'SP101', name: 'Social and Professional Issues', units: 3, grade: 3.30 }
            ]
        }
    }
};

const defaultCourseList = [
    { code: 'SA 101', name: 'System Administration And Maintenance', units: 3, grade: 0 },
    { code: 'ITSP2B', name: 'Network Implementation And Support II', units: 3, grade: 0 },
    { code: 'BPM101', name: 'Business Process Management In IT', units: 3, grade: 0 },
    { code: 'TEC101', name: 'Technopreneurship', units: 3, grade: 0 },
    { code: 'IAS102', name: 'Information Assurance And Security 2', units: 3, grade: 0 },
    { code: 'SP101', name: 'Social and Professional Issues', units: 3, grade: 0 }
];

const ACADEMIC_YEARS = ['2023-2024', '2022-2023', '2021-2022'];
const SEMESTERS = ['1st Semester', '2nd Semester'];

function buildDefaultAcademicRecords() {
    const records = {};
    ACADEMIC_YEARS.forEach(year => {
        records[year] = {
            '1st Semester': JSON.parse(JSON.stringify(defaultCourseList)),
            '2nd Semester': JSON.parse(JSON.stringify(defaultCourseList))
        };
    });
    return records;
}

const defaultAcademicRecords = buildDefaultAcademicRecords();

const DB = {
    init() {
        if (!localStorage.getItem(DB_KEY)) {
            const initialData = [defaultStudent];
            localStorage.setItem(DB_KEY, JSON.stringify(initialData));
            console.log('Database initialized with default data.');
        }
    },

    getAll() {
        this.init();
        return JSON.parse(localStorage.getItem(DB_KEY));
    },

    getById(id) {
        const students = this.getAll();
        const student = students.find(s => String(s.id) === String(id));
        if (!student) return null;
        // Ensure academicRecords exists and has all years/semesters (merge missing, keep existing grades)
        const fullRecords = buildDefaultAcademicRecords();
        const existing = student.academicRecords && typeof student.academicRecords === 'object' ? student.academicRecords : {};
        ACADEMIC_YEARS.forEach(year => {
            if (!fullRecords[year]) fullRecords[year] = {};
            SEMESTERS.forEach(sem => {
                const existingEntries = existing[year] && existing[year][sem];
                if (Array.isArray(existingEntries) && existingEntries.length > 0) {
                    fullRecords[year][sem] = existingEntries.map(entry => ({
                        code: entry.code,
                        name: entry.name || '',
                        units: parseInt(entry.units, 10) || 0,
                        grade: entry.grade != null && entry.grade !== '' ? parseFloat(entry.grade) : 0
                    }));
                }
            });
        });
        student.academicRecords = fullRecords;
        const hadPartialRecords = !existing || !ACADEMIC_YEARS.every(y => existing[y] && SEMESTERS.every(s => Array.isArray(existing[y] && existing[y][s])));
        if (hadPartialRecords) {
            this.update(id, { academicRecords: fullRecords });
        }
        return JSON.parse(JSON.stringify(student));
    },

    save(student) {
        const students = this.getAll();
        if (!student.id) {
            const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            student.id = `${datePart}${randomPart}`;
        }

        // Apply default records to new students
        if (!student.academicRecords) {
            student.academicRecords = JSON.parse(JSON.stringify(defaultAcademicRecords));
        }

        students.push(student);
        localStorage.setItem(DB_KEY, JSON.stringify(students));
        return student;
    },

    update(id, updatedFields) {
        const students = this.getAll();
        const index = students.findIndex(s => String(s.id) === String(id));
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedFields };
            localStorage.setItem(DB_KEY, JSON.stringify(students));
            return students[index];
        }
        return null;
    },

    add(student) {
        const saved = this.save(student);
        this.setActive(saved.id); // Set as active after adding
        return saved;
    },

    setActive(id) {
        localStorage.setItem('active_student_id', id);
    },

    getActive() {
        const id = localStorage.getItem('active_student_id');
        if (id) {
            return this.getById(id);
        }

        const students = this.getAll();
        if (students.length) {
            const latest = students[students.length - 1];
            return this.getById(latest.id); // Triggers auto-init via getById
        }
        return null;
    }
};

window.StudentDB = DB;
