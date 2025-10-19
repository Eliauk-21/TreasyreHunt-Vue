// 用户服务 - 处理用户数据
export const userService = {
    // 模拟用户数据存储
    users: JSON.parse(localStorage.getItem('treasureGameUsers')) || [],

    // 注册用户
    register(userData) {
        const existingUser = this.users.find(user => user.username === userData.username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }

        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // 实际应用中应该加密
            createdAt: new Date().toISOString(),
            gameStats: {
                puzzlesSolved: 0,
                locationsCompleted: 0,
                totalScore: 0,
                timePlayed: 0
            }
        };

        this.users.push(newUser);
        this.saveUsers();
        return newUser;
    },

    // 用户登录
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        return user;
    },

    // 更新用户资料
    updateProfile(userId, updates) {
        const userIndex = this.users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            throw new Error('用户不存在');
        }

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();
        return this.users[userIndex];
    },

    // 更新游戏统计
    updateGameStats(userId, stats) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.gameStats = { ...user.gameStats, ...stats };
            this.saveUsers();
        }
    },

    // 获取排行榜
    getLeaderboard() {
        return this.users
            .map(user => ({
                username: user.username,
                score: user.gameStats.totalScore,
                completed: user.gameStats.locationsCompleted,
                puzzlesSolved: user.gameStats.puzzlesSolved
            }))
            .sort((a, b) => b.score - a.score)
            .map((user, index) => ({ ...user, rank: index + 1 }))
            .slice(0, 10);
    },

    // 保存用户数据到本地存储
    saveUsers() {
        localStorage.setItem('treasureGameUsers', JSON.stringify(this.users));
    }
};