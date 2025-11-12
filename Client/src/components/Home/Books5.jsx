import React from 'react';

const Books5 = ({ className = "" }) => {
  const books = [
    {
      id: 1,
      title: "ہلال",
      subtitle: "واقعی",
      bgColor: "bg-red-900",
      textColor: "text-white",
      type: "collage"
    },
    {
      id: 2,
      title: "Eid ul Fitr",
      subtitle: "Har",
      bgColor: "bg-pink-200",
      textColor: "text-red-600",
      type: "simple"
    },
    {
      id: 3,
      title: "HILAL Kids",
      subtitle: "HAPPY EARTH DAY",
      bgColor: "bg-blue-200",
      textColor: "text-blue-800",
      type: "earth"
    },
    {
      id: 4,
      title: "ہلال",
      subtitle: "موسم گرما",
      bgColor: "bg-green-300",
      textColor: "text-green-800",
      type: "summer"
    },
    {
      id: 5,
      title: "HILAL HER",
      subtitle: "Women",
      bgColor: "bg-pink-500",
      textColor: "text-white",
      type: "women"
    }
  ];

  const renderBookContent = (book) => {
    const bookImages = [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=300&fit=crop',
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200&h=300&fit=crop',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
        
        
      ];
      
      
    
    return (
      <div className="absolute inset-0">
        <img 
          src={bookImages[book.id - 1]} 
          alt={`Book ${book.id}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            e.target.style.display = 'block';
          }}
        />
      </div>
    );
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {books.map((book) => (
        <div
          key={book.id}
          className="w-24 h-34 relative overflow-hidden "
        >
          {renderBookContent(book)}
        </div>
      ))}
    </div>
  );
};

export default Books5;