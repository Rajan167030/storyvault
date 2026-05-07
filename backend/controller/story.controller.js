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
        await Story.deleteMany();
       await Story.insertMany(stories);
        return res.json({message : "Stories scraped and saved to database successfully!" , stories}) ;
    } catch (error) {
        return res.status(500).json({message : "Error scraping stories"})
    }


}

export const getStories = async (req , res)=>{
    try {
        const stories = await Story.find();
        return res.json({stories});
    } catch (error) {
        return res.status(500).json({message : "Error fetching stories"});
    }
}

