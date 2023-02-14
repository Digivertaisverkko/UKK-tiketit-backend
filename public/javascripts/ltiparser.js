

module.exports = {

    coursePositionFromLtiRoles: function(ltiRoleList) {

        const adminRoles = ['http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator',
                            'http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper',
                            'Administrator',
                            'ContentDeveloper'];

        const teacherRoles = ['http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
                              'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor',
                              'http://purl.imsglobal.org/vocab/lis/v2/membership#Manager',
                              'Instructor',
                              'Mentor',
                              'Manager'];

        const studentRoles = ['http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
                              'http://purl.imsglobal.org/vocab/lis/v2/membership#Member',
                              'http://purl.imsglobal.org/vocab/lis/v2/membership#Officer',
                              'Learner',
                              'Member',
                              'Officer'];

    
        if (ltiRoleList.some((r) => teacherRoles.includes(r) )) {
            return 'opettaja';
        } else if (ltiRoleList.some((r) => adminRoles.includes(r) )) {
            return 'opiskelija'; 
        } else {
            return 'opiskelija';
        }
    }

};
