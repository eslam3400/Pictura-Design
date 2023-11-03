"use client"; // next.js app router

import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";

const Fabric = () => {
  const imageInputRef = useRef(null);
  const textInputRef = useRef(null);
  const [canvas, setCanvas] = useState<fabric.Canvas>();
  const [text, setText] = useState('Type your text here');
  const [textColor, setTextColor] = useState('black');
  const [design, setDesign]: any = useState({
    front: { backgroundImage: "/t-shirt.png", elements: [] },
    back: { backgroundImage: "/t-shirt2.png", elements: [] },
    left: { backgroundImage: "/t-shirt3.png", elements: [] },
    right: { backgroundImage: "/t-shirt4.png", elements: [] },
  });
  const [side, setSide] = useState('front');

  useEffect(() => {
    const c = new fabric.Canvas("canvas", {
      height: 500,
      width: 500,
      selection: true,
      backgroundImage: design[side].backgroundImage,
    });

    for (const element of design[side].elements) {
      if (element.type?.includes('image')) {
        fabric.Image.fromURL(element.url, (img => { console.log(img); c?.add(img) }));
      }
      else c.add(element);
    }

    setCanvas(c);

    return () => {
      c.dispose();
    };
  }, [side]);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {

      const reader = new FileReader();

      reader.onload = function (e: any) {
        const imageUrl = e.target.result;
        fabric.Image.fromURL(imageUrl, (img: any) => {
          img.url = imageUrl;
          design[side].elements.push(img);
          canvas?.add(img);
        });
      };

      reader.readAsDataURL(file);
    }
  }

  const addText = () => {
    const newText = new fabric.Text(text, {
      left: 100,
      top: 100,
      fill: textColor,
    });

    design[side].elements.push(newText);
    canvas?.add(newText);
  };

  const handleTextChange = (e: any) => {
    setText(e.target.value);
  };

  const handleColorChange = (e: any) => {
    setTextColor(e.target.value);
  };

  const deleteSelected = () => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      canvas?.remove(activeObject);
      canvas?.discardActiveObject();
      canvas?.renderAll();
      design[side].elements = canvas?.getObjects();
    }
  };

  const handleSideChange = (selected: string) => {
    setSide(selected);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        ref={imageInputRef}
      />
      <br />
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        ref={textInputRef}
      />
      <input
        type="color"
        value={textColor}
        onChange={handleColorChange}
      />
      <br />
      <button onClick={addText}>Add Text</button>
      <br />
      <button onClick={deleteSelected}>Delete Selected</button>
      <br />
      <button onClick={() => handleSideChange("front")}>front</button>
      <br />
      <button onClick={() => handleSideChange("back")}>back</button>
      <br />
      <button onClick={() => handleSideChange("left")}>left</button>
      <br />
      <button onClick={() => handleSideChange("right")}>right</button>
      <canvas id="canvas" />
    </div>
  );
};

export default Fabric;