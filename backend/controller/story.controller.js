import * as cheerio from 'cheerio';
import axios from 'axios';
import Story from '../models/story.model.js';
import { protect } from '../middleware/user.middleware.js';
  const getHtml = async (url)=>{
    const {data} = await axios.get(url);
    return data;
}

export const scrapeStories = async (req , res)=>{

    try {
        const html = await getHtml('https://news.ycombinator.com/');
        const $ = cheerio.load(html);
        const stories = [];
        $(".athing").each((index , element)=>{
            const title = $(element).find('.titleline a').text();
            const URL = $(element).find('.titleline a').attr('href');
            const points = parseInt($(element).next().find('.score').text()) || 0;
            const author = $(element).next().find('.hnuser').text();
            const postedAt = $(element).next().find('.age').text();
            stories.push({title , URL , points , author , postedAt});
        });
        const savedStories = await Promise.all(
            stories.map((story) =>
                Story.findOneAndUpdate(
                    { URL: story.URL },
                    { $set: story },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                )
            )
        );
        const payload = {message : "Stories scraped and saved to database successfully!" , stories : savedStories};
        if (res) {
            return res.json(payload);
        }

        return payload;
    } catch (error) {
        if (res) {
            return res.status(500).json({message : "Error scraping stories"});
        }

        throw error;
    }


}

export const getStories = async (req , res)=>{
    try {
        const stories = await Story.find().sort({ updatedAt: -1, createdAt: -1 }).limit(100);
        return res.json({stories});
    } catch (error) {
        return res.status(500).json({message : "Error fetching stories"});
    }
}
