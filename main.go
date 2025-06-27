package main

import (
	"fmt" // 虽然目前没有直接用到io，但保留以防后续扩展
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time" // 导入 time 包

	"github.com/gin-gonic/gin"
)

const uploadDir = "./uploads" // 图片上传目录

func init() {
	// 确保上传目录存在
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		err := os.Mkdir(uploadDir, os.ModePerm)
		if err != nil {
			fmt.Printf("Error creating upload directory: %v\n", err)
			os.Exit(1) // 如果创建目录失败，程序无法正常运行，直接退出
		}
	}
}

func main() {
	r := gin.Default()

	// 跨域中间件 (开发环境需要，生产环境可能需要更精细的配置)
	// 允许来自任何源的请求，并支持 GET, POST, OPTIONS 方法
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "https://slideshow-vito-1788.web.app") // 將這個 URL 替換進去
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		// 允许的头部，这里列举了一些常用的
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		// 处理 OPTIONS 请求 (CORS 预检请求)
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	// 提供静态文件服务，用于访问上传的图片
	// 当访问 /images/{filename} 时，会从 ./uploads 目录查找对应的文件
	r.Static("/images", uploadDir)

	api := r.Group("/api")
	{
		api.GET("/images", getImages)    // 获取所有图片文件名列表
		api.POST("/upload", uploadImage) // 上传图片
	}

	// 运行在 8080 端口
	fmt.Println("Server is running on :8080")
	// 從環境變數獲取埠號，如果沒有則預設為 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("Server is running on :" + port)
	r.Run(":" + port)
}

// getImages 处理获取图片列表的请求
func getImages(c *gin.Context) {
	files, err := os.ReadDir(uploadDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read upload directory: " + err.Error()})
		return
	}

	var imageNames []string
	for _, file := range files {
		if !file.IsDir() { // 只处理文件，跳过子目录
			// 简单过滤图片文件，只检查常见的图片扩展名
			ext := strings.ToLower(filepath.Ext(file.Name()))
			if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".webp" || ext == ".bmp" {
				imageNames = append(imageNames, file.Name())
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{"images": imageNames})
}

// uploadImage 处理图片上传请求
func uploadImage(c *gin.Context) {
	// 获取表单中的文件，字段名为 "image"
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get image file from form: " + err.Error()})
		return
	}

	// 限制文件大小（例如：最大 10MB）
	if file.Size > 10*1024*1024 { // 10MB
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 10MB limit."})
		return
	}

	// 确保文件名唯一，避免覆盖同名文件
	// 使用纳秒时间戳作为前缀，结合原始文件名
	uniqueFileName := strconv.FormatInt(time.Now().UnixNano(), 10) + "_" + filepath.Base(file.Filename)
	destinationPath := filepath.Join(uploadDir, uniqueFileName)

	// 保存上传的文件到指定路径
	if err := c.SaveUploadedFile(file, destinationPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image file: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image uploaded successfully", "filename": uniqueFileName})
}
