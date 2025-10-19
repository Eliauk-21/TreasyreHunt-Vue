// 游戏服务 - 处理游戏逻辑
export const gameService = {
    // 谜题库
    puzzles: {
        library: [
            {
                question: "我说话但没有嘴，我流动但没有水，我奔跑但没有腿。我是什么？",
                options: ["时间", "河流", "风", "思想"],
                answer: 2
            },
            {
                question: "什么东西越洗越脏？",
                options: ["水", "衣服", "思想", "空气"],
                answer: 0
            }
        ],
        temple: [
            {
                question: "什么东西打破了才能用？",
                options: ["鸡蛋", "记录", "沉默", "规则"],
                answer: 0
            }
        ],
        cave: [
            {
                question: "什么东西有头有尾，但没有身体？",
                options: ["硬币", "蛇", "故事", "河流"],
                answer: 0
            }
        ],
        mountain: [
            {
                question: "什么东西属于你，但别人用得更多？",
                options: ["名字", "时间", "金钱", "思想"],
                answer: 0
            }
        ],
        ruins: [
            {
                question: "什么东西能装满房间，但不占空间？",
                options: ["光", "声音", "气味", "思想"],
                answer: 0
            }
        ],
        treasure: [
            {
                question: "最终谜题：什么是最珍贵的宝藏？",
                options: ["黄金", "知识", "友谊", "时间"],
                answer: 1
            }
        ]
    },

    // 获取随机谜题
    getRandomPuzzle(location) {
        const puzzles = this.puzzles[location] || this.puzzles.library;
        return puzzles[Math.floor(Math.random() * puzzles.length)];
    },

    // 检查答案
    checkAnswer(puzzle, selectedIndex) {
        return puzzle.answer === selectedIndex;
    },

    // 计算得分
    calculateScore(difficulty, timeUsed) {
        const baseScore = 100;
        const timeBonus = Math.max(0, 300 - timeUsed); // 5分钟内完成有奖励
        return baseScore + timeBonus;
    }
};