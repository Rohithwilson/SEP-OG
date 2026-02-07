const startTest = async () => {
    const baseUrl = 'http://localhost:5000/api';

    const post = async (url, body) => {
        const res = await fetch(baseUrl + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    };

    const get = async (url) => {
        const res = await fetch(baseUrl + url);
        return res.json();
    };

    const put = async (url, body) => {
        const res = await fetch(baseUrl + url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    };

    try {
        console.log("Starting Workflow Verification...");

        // 1. Register Student
        const student = { name: "Test Student", email: `student_${Date.now()}@test.com`, password: "123", role: "student", department: "CSE", mobile: "1234567890" };
        const regStudent = await post('/auth/register', student);
        console.log("Registered Student:", regStudent);

        // 2. Login Student
        const loginStudent = await post('/auth/login', { email: student.email, password: student.password });
        console.log("Logged in Student:", loginStudent.user.id);
        const studentId = loginStudent.user.id;

        // 3. Create Request
        const requestData = { student_id: studentId, event_name: "Tech Fest", venue: "College B", event_date: "2026-03-20T10:00" };
        const newRequest = await post('/requests/create', requestData);
        console.log("Created Request:", newRequest);
        const requestId = newRequest.id;

        // 4. Register Mentor
        const mentor = { name: "Test Mentor", email: `mentor_${Date.now()}@test.com`, password: "123", role: "mentor", department: "CSE", mobile: "1234567891" };
        await post('/auth/register', mentor);
        const loginMentor = await post('/auth/login', { email: mentor.email, password: mentor.password });
        console.log("Logged in Mentor:", loginMentor.user.id);
        const mentorId = loginMentor.user.id;

        // 5. Mentor View Requests
        const mentorRequests = await get(`/requests?role=mentor&user_id=${mentorId}`);
        const foundReq = mentorRequests.requests.find(r => r.id === requestId);
        if (foundReq) console.log("Mentor found request:", foundReq.id);
        else console.error("Mentor did NOT find request");

        // 6. Mentor Approve
        const mentorApprove = await put(`/requests/${requestId}/status`, { role: 'mentor', action: 'Approve', user_id: mentorId });
        console.log("Mentor Response:", mentorApprove);

        // 7. Register HOD
        const hod = { name: "Test HOD", email: `hod_${Date.now()}@test.com`, password: "123", role: "hod", department: "CSE", mobile: "1234567892" };
        await post('/auth/register', hod);
        const loginHOD = await post('/auth/login', { email: hod.email, password: hod.password });
        console.log("Logged in HOD:", loginHOD.user.id);
        const hodId = loginHOD.user.id;

        // 8. HOD View Requests
        const hodRequests = await get(`/requests?role=hod&user_id=${hodId}`);
        const foundHodReq = hodRequests.requests.find(r => r.id === requestId);
        if (foundHodReq) console.log("HOD found request:", foundHodReq.id);
        else console.error("HOD did NOT find request");

        // 9. HOD Approve
        const hodApprove = await put(`/requests/${requestId}/status`, { role: 'hod', action: 'Approve', user_id: hodId });
        console.log("HOD Response:", hodApprove);

        // 10. Student Verify
        const studentRequests = await get(`/requests?role=student&user_id=${studentId}`);
        const finalReq = studentRequests.requests.find(r => r.id === requestId);
        console.log("Final Request Status:", finalReq.status, "| Mentor:", finalReq.mentor_status, "| HOD:", finalReq.hod_status);

        if (finalReq.status === 'Approved' && finalReq.mentor_status === 'Approved' && finalReq.hod_status === 'Approved') {
            console.log("✅ VERIFICATION SUCCESSFUL");
        } else {
            console.error("❌ VERIFICATION FAILED");
        }

    } catch (e) {
        console.error("Test Failed:", e);
    }
};

startTest();
