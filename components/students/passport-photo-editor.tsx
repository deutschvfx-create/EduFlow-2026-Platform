"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Upload,
    RotateCw,
    ZoomIn,
    ZoomOut,
    Check,
    X,
    Camera,
    Trash2
} from "lucide-react";
import heic2any from "heic2any";
import { cn } from "@/lib/utils";

interface PassportPhotoEditorProps {
    onSave: (imageDataUrl: string) => void;
    onCancel: () => void;
    onDelete?: () => void;
    currentPhotoUrl?: string;
    initialImage?: string | null;
}

export function PassportPhotoEditor({
    onSave,
    onCancel,
    onDelete,
    currentPhotoUrl,
    initialImage
}: PassportPhotoEditorProps) {
    const [image, setImage] = useState<string | null>(initialImage || currentPhotoUrl || null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Update image if initialImage changes
    React.useEffect(() => {
        if (initialImage) setImage(initialImage);
    }, [initialImage]);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("Ошибка: Файл слишком большой (макс. 5MB)");
                return;
            }
            try {
                let processedFile = file;
                if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.8
                    });
                    processedFile = new File([Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob],
                        file.name.replace(/\.heic$/i, '.jpg'), { type: "image/jpeg" });
                }
                const reader = new FileReader();
                reader.onload = () => setImage(reader.result as string);
                reader.readAsDataURL(processedFile);
            } catch (err) {
                console.error(err);
                alert("Ошибка при обработке файла");
            }
        }
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async () => {
        if (!image || !croppedAreaPixels) return;
        setIsSaving(true);
        try {
            const img = await createImage(image);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Target dimensions matching passport aspect (165:230)
            const targetWidth = 512;
            const targetHeight = Math.round(512 * (230 / 165));
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Set background white
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Create temporary canvas for rotation and full image processing
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;

            const rotRad = (rotation * Math.PI) / 180;
            const bWidth = Math.abs(Math.cos(rotRad) * img.width) + Math.abs(Math.sin(rotRad) * img.height);
            const bHeight = Math.abs(Math.sin(rotRad) * img.width) + Math.abs(Math.cos(rotRad) * img.height);

            tempCanvas.width = bWidth;
            tempCanvas.height = bHeight;
            tempCtx.translate(bWidth / 2, bHeight / 2);
            tempCtx.rotate(rotRad);
            tempCtx.translate(-img.width / 2, -img.height / 2);
            tempCtx.drawImage(img, 0, 0);

            // Final crop
            ctx.drawImage(
                tempCanvas,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                canvas.width,
                canvas.height
            );

            onSave(canvas.toDataURL('image/jpeg', 0.9));
        } catch (e) {
            console.error(e);
            alert("Ошибка при сохранении фото");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {!image ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#E2E8F0] rounded-[32px] bg-[#F8FAFC] gap-4">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-[#2563EB]">
                        <Camera className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <p className="text-[14px] font-bold text-[#0F172A] mb-1">Загрузите фотографию</p>
                        <p className="text-[12px] text-[#64748B]">Система автоматически откроет редактор</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => document.getElementById('modal-file-picker')?.click()}
                        className="rounded-full px-6 border-[#E2E8F0] hover:bg-white"
                    >
                        Выбрать файл
                    </Button>
                    <input id="modal-file-picker" type="file" className="hidden" accept="image/*,.heic" onChange={handleFileChange} />
                </div>
            ) : (
                <>
                    {/* PASSPORT MOCKUP AREA */}
                    <div className="relative flex flex-col items-center justify-center p-8 bg-[#F1F5F9] rounded-[32px] overflow-hidden min-h-[440px]">
                        <div className="relative w-[340px] h-[210px] bg-white rounded-[12px] shadow-2xl border border-[#E2E8F0] overflow-hidden pointer-events-none scale-110">
                            {/* Blue Header */}
                            <div className="absolute top-0 left-0 right-0 h-9 bg-[#2563EB]" />

                            {/* Dummy Content Lines */}
                            <div className="absolute top-12 left-[130px] space-y-2 opacity-[0.03]">
                                <div className="h-2.5 w-32 bg-black rounded-full" />
                                <div className="h-2.5 w-24 bg-black rounded-full" />
                                <div className="h-2.5 w-28 bg-black rounded-full" />
                            </div>

                            {/* THE PHOTO WINDOW (Cropper) */}
                            <div className="absolute top-[38px] left-[12px] w-[105px] h-[145px] bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] overflow-hidden pointer-events-auto">
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={165 / 230}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    showGrid={false}
                                    style={{
                                        containerStyle: { width: '100%', height: '100%', position: 'relative' }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Centering Guide Hint */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
                            <span className="bg-[#0F172A] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                Центрируйте лицо в рамке
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Tools */}
                        <div className="grid grid-cols-2 gap-10 px-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                                        <ZoomIn className="h-2.5 w-2.5" /> Масштаб
                                    </label>
                                    <span className="text-[10px] font-bold text-[#0F172A] opacity-80">{Math.round(zoom * 100)}%</span>
                                </div>
                                <div className="h-4 flex items-center">
                                    <Slider
                                        value={[zoom]}
                                        min={1}
                                        max={3}
                                        step={0.01}
                                        onValueChange={([v]) => setZoom(v)}
                                        className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.relative]:h-0.5"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                                        <RotateCw className="h-2.5 w-2.5" /> Поворот
                                    </label>
                                    <span className="text-[10px] font-bold text-[#0F172A] opacity-80">
                                        {rotation > 0 ? `+${rotation}` : rotation}°
                                    </span>
                                </div>
                                <div className="h-4 flex items-center">
                                    <Slider
                                        value={[rotation]}
                                        min={-180}
                                        max={180}
                                        step={1}
                                        onValueChange={([v]) => setRotation(v)}
                                        className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.relative]:h-0.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    onClick={onDelete}
                                    disabled={isSaving}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full font-black text-[13px] px-6"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Удалить
                                </Button>
                            )}
                            <div className="flex-1" />
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                disabled={isSaving}
                                className="rounded-full font-extrabold text-[13px] px-6 text-[#64748B]"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={getCroppedImg}
                                disabled={isSaving || !image}
                                className="rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-[14px] px-10 h-12 shadow-lg shadow-[#2563EB]/20 transition-all"
                            >
                                {isSaving ? "Сохранение..." : "Сохранить"}
                            </Button>
                        </div>

                        {/* Change File Link */}
                        <div className="flex justify-center">
                            <Button
                                variant="link"
                                onClick={() => document.getElementById('modal-file-picker')?.click()}
                                className="text-[12px] text-[#2563EB] font-black hover:no-underline flex items-center gap-2"
                            >
                                <Camera className="h-3.5 w-3.5" />
                                Выбрать другое фото
                            </Button>
                            <input id="modal-file-picker" type="file" className="hidden" accept="image/*,.heic" onChange={handleFileChange} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
