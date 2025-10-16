// data/articles/reviews.js
import reviewsGear from './reviewsGear';
import reviewsMotorcycles from './reviewsMotorcycles';
import reviewsVideo from './reviewsVideo';

const reviews = [...reviewsGear, ...reviewsMotorcycles, ...reviewsVideo];
export default reviews;
