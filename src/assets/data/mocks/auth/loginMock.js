const loginMock = {
  success: true,
  message: "Login successfully",

  data: 
    {
      resLoginDTO: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        user: {
          id: "USR001",
          email: "admin@gmail.com",
          name: "Administrator",
          role: {
            id: 1,
            name: "ADMIN",
            description: "Quản trị hệ thống",
            activeFlag: true,
          },
        },
      },
      responseCookie: {
        name: "refresh_token",
        value: "refresh-token-value",
      },
    },
};

export default loginMock;
