class AIService {
    static async getDemandForecast(serviceType, location, date) {
        // Logic to communicate with FastAPI ML Service via axios
        return { expectedDemand: 15, recommendation: 'Increase worker availability in this zone' };
    }
}

module.exports = AIService;
