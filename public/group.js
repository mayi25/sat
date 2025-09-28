document.getElementById('create-group-btn').addEventListener('click', () => {
    const groupName = document.getElementById('new-group-name').value;
    const course = document.getElementById('course-select').value;
    if (groupName && course) {
        alert(`Group "${groupName}" created for course "${course}"`);
    } else {
        alert('Please enter a group name and select a course.');
    }
});

document.getElementById('join-group-btn').addEventListener('click', () => {
    const groupCode = document.getElementById('join-group-code').value;
    if (groupCode) {
        alert(`Joining group with code "${groupCode}"`);
    } else {
        alert('Please enter a group code.');
    }
});
