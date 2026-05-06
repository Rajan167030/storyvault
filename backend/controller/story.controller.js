import * as cheerio from 'cheerio';
import axios from 'axios';
import Story from '../models/story.model.js';

const getHtml = async (url)=>{
    const {data} = await axios.get(url);
    return data;
}


const scrapeStories = async (req , res)=>{
    const html = await getHtml('https://news.ycombinator.com/');
    const $ = cheerio.laod(html);
    const stories = [];
    $(".athing").each((index , element)=>{
        const title = $(element).find('.titleline a').text();
        const URL = $(element).find('.titleline a').attr('href');
        const points = parseInt($(element).next().find('.score').text()) || 0;
        const author = $(element).next().find('.hnuser').text();
        const postedAt = $(element).next().find('.age').text();
        stories.push({title , URL , points , author , postedAt});
    });
    return stories;
}