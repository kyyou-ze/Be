// app.js  [#2]
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { errorHandler } = require('./Middleware/errorHandler');
const authRoutes = require('./Routes/auth.routes');
const userRoutes = require('./Routes/user.routes');
const novelRoutes = require('./Routes/novel.routes');
const chapterRoutes = require('./Routes/chapter.routes');
const genreRoutes = require('./Routes/genre.routes');
const commentRoutes = require('./Routes/comment.routes');

const app = express();

// Middleware global
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '2mb' })); // support base64 or text content
app.use(morgan('dev'));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/comments', commentRoutes);


app.use(errorHandler);

module.exports = app;



